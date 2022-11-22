import { crocks, R } from "./deps.js";
import {
  asyncifyMapTokenErrs,
  compose,
  handleHyperErr,
  isAwsNoSuchKeyErr,
  logger,
} from "./lib/utils.js";
import processTasks from "./process-tasks.js";

const { Async } = crocks;
const {
  all,
  always,
  assoc,
  dissoc,
  equals,
  filter,
  keys,
  map,
  pluck,
  prop,
  propEq,
  ifElse,
  identity,
  omit,
} = R;

const [ERROR, READY, PROCESSED, QUEUES, BUCKET_NOT_FOUND_CODE] = [
  "ERROR",
  "READY",
  "PROCESSED",
  "QUEUES",
  "Http404",
];

/**
 * TODO: handle some errors
 * TODO: use addEventListener api to emit unhealthy state to core
 */
export function adapter({ name, concurrency, sleep, aws: { s3, sqs } }) {
  const svcName = name;
  // wrap aws functions into Asyncs
  const checkBucket = asyncifyMapTokenErrs(s3.checkBucket);
  const createBucket = asyncifyMapTokenErrs(s3.createBucket);
  const createQueue = asyncifyMapTokenErrs(sqs.createQueue);
  const getObject = asyncifyMapTokenErrs(s3.getObject);
  const putObject = R.curry(function (a, b, c) {
    return asyncifyMapTokenErrs(s3.putObject)(a, b, c);
  });
  const getQueueUrl = asyncifyMapTokenErrs(sqs.getQueueUrl);
  const deleteQueue = asyncifyMapTokenErrs(sqs.deleteQueue);
  const deleteBucket = asyncifyMapTokenErrs(s3.deleteBucket);
  const deleteObject = asyncifyMapTokenErrs(s3.deleteObject);
  const sendMessage = asyncifyMapTokenErrs(sqs.sendMessage);
  const receiveMessage = asyncifyMapTokenErrs(sqs.receiveMessage);
  const deleteMessage = asyncifyMapTokenErrs(sqs.deleteMessage);
  const listObjects = asyncifyMapTokenErrs(s3.listObjects);
  const asyncFetch = Async.fromPromise(fetch);

  /**
   * Listen for queue messages, starting in {sleep} milliseconds.
   * Instead of 1 task, processing {concurrency} messages at a time:
   * [x,x,x,x,x,x,x] -> [x,x,x,x,x,x,x] -> ....
   *
   * We use {concurrency} tasks, each processing 1 message a time:
   * [
   *  [x] -> [x] -> [x] -> [x] -> ...
   *  [x] -> [x] -> ...
   *  [x] -> [x] -> [x] -> ...
   * ]
   *
   * This hedges against long-processing messages from stalling all
   * message retrieval
   */
  const timeouts = [];
  if (Deno.env.get("DENO_ENV") !== "test") {
    Array(concurrency).fill(0).forEach((_, i) => {
      const log = logger(i);
      timeouts.push(queueProcessTasks(sleep));
      function queueProcessTasks(delay) {
        return setTimeout(() =>
          processTasks(svcName, asyncFetch, {
            getQueueUrl,
            receiveMessage,
            deleteMessage,
            putObject,
            deleteObject,
            log,
          })
            .bichain(
              (e) => {
                log("error processing jobs: ", e.msg || e.message);
                // error processing jobs, so converge to no jobs processed
                return Async.Resolved([]);
              },
              (r) => {
                log("processed jobs: ", r);
                return Async.Resolved(r || []);
              },
            )
            .map(
              (r) => {
                let nextDelay = 500; // wait half a second by default, effectively immediate
                if (!r.length) {
                  log(`Sleeping for ${sleep} milliseconds...`);
                  // no jobs to be processed, so wait the sleep amount
                  nextDelay = sleep;
                }

                return nextDelay;
              },
            )
            // queue up the next processTasks
            .map(queueProcessTasks)
            .fork(identity, identity), delay);
      }
    });
  }

  return Object.freeze({
    cleanup: () => timeouts && timeouts.map((t) => clearTimeout(t)),
    // list queues
    index: () =>
      getObject(svcName, QUEUES).map(keys).bichain(
        handleHyperErr,
        Async.Resolved,
      ).toPromise(),
    // create queue
    create: ({ name, target, secret }) => {
      return Async.all([
        findOrCreateBucket(svcName),
        createQueue(svcName),
      ])
        .chain(() => getObject(svcName, QUEUES))
        .bichain(
          (err) =>
            isAwsNoSuchKeyErr(err)
              ? putObject(svcName, QUEUES, {}).map(() => ({}))
              : Async.Rejected(err),
          Async.Resolved,
        )
        .map(assoc(name, { target, secret }))
        .chain(putObject(svcName, QUEUES))
        .bichain(
          handleHyperErr,
          Async.Resolved,
        )
        .toPromise();
    },
    // delete queue
    delete: (name) =>
      getObject(svcName, QUEUES)
        .map(dissoc(name))
        .chain((queues) =>
          // remove parent queue and bucket if no more queues defined
          keys(queues).length === 0
            ? deleteObject(svcName, QUEUES)
              .chain(() =>
                Async.all([
                  getQueueUrl(svcName).chain(deleteQueue),
                  deleteBucket(svcName),
                ])
              )
              .map((results) => ({
                ok: all(equals(true), pluck("ok", results)),
              }))
            : putObject(svcName, QUEUES, queues)
        )
        .bichain(
          handleHyperErr,
          Async.Resolved,
        )
        .toPromise(),
    // post job
    post: ({ name, job }) =>
      getObject(svcName, QUEUES)
        .map(prop(name))
        .map(assoc("queue", name))
        .map(assoc("job", job))
        .chain(postJob(name))
        .map((res) => ({ ok: true, id: res.id }))
        .bichain(
          handleHyperErr,
          Async.Resolved,
        )
        .toPromise(),
    // get jobs
    get: ({ name, status }) =>
      listObjects(svcName, name)
        .chain(includeDocs)
        .map(filter(propEq("status", status)))
        .map(map(omit(["secret", "queue", "target"])))
        .map((jobs) => ({ ok: true, jobs }))
        .bichain(
          handleHyperErr,
          Async.Resolved,
        )
        .toPromise(),
    // retry job
    retry: ({ name, id }) =>
      getObject(svcName, `${name}/${id}`)
        .chain(({ status, job }) => {
          if (status === ERROR) {
            return postJob(name)(job)
              .chain(() => deleteObject(svcName, `${name}/${id}`))
              .map(() => ({ ok: true, id }));
          }
          return Async.Resolved({ ok: true, id });
        })
        .bichain(
          handleHyperErr,
          Async.Resolved,
        )
        .toPromise(),
    // cancel job
    cancel: ({ name, id }) =>
      deleteObject(svcName, `${name}/${id}`)
        .map(() => ({ ok: true, id }))
        .bichain(
          handleHyperErr,
          Async.Resolved,
        )
        .toPromise(),
  });

  function postJob(queue) {
    return (job) =>
      getQueueUrl(svcName)
        .chain((url) => sendMessage(url, job))
        .map(({ MessageId }) => ({
          ok: true,
          id: MessageId,
          job: compose(
            assoc("id", MessageId),
            assoc("status", READY),
          )(job),
        }))
        .chain((result) =>
          putObject(svcName, `${queue}/${result.id}`, result.job).map(() =>
            result
          )
        );
  }
  function includeDocs(keys) {
    return Async.all(
      map(
        (key) =>
          getObject(svcName, key)
            .bichain(
              (err) => {
                /**
                 * Since fetching the list of object keys,
                 * the object was deleted (ie. processed), (race condition)
                 * so just return a mock PROCESSED object that is filtered out anyway
                 */
                return isAwsNoSuchKeyErr(err)
                  ? Async.Resolved({ status: PROCESSED })
                  : Async.Rejected(err);
              },
              Async.Resolved,
            ),
        keys,
      ),
    );
  }

  /**
   * Check if the bucket exists, and create if not
   */
  function findOrCreateBucket(name) {
    return checkBucket(name)
      .bichain(
        ifElse(
          propEq("code", BUCKET_NOT_FOUND_CODE),
          always(Async.Resolved(false)), // bucket does not exist
          Async.Rejected, // some unknown err, so bubble
        ),
        always(Async.Resolved(true)),
      )
      .chain((exists) => exists ? Async.Resolved() : createBucket(name));
  }
}
