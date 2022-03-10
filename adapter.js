import { crocks, R } from "./deps.js";
import { asyncifyMapTokenErrs, handleHyperErr } from "./lib/utils.js";
import processTasks from "./process-tasks.js";

const { Async } = crocks;
const {
  all,
  assoc,
  dissoc,
  equals,
  filter,
  keys,
  map,
  pluck,
  prop,
  propEq,
} = R;

const [ERROR, READY, QUEUES] = ["ERROR", "READY", "QUEUES"];

/**
 * TODO: handle some errors
 * TODO: use addEventListener api to emit unhealthy state to core
 */
export function adapter({ name, aws: { s3, sqs } }) {
  const svcName = name;
  // wrap aws functions into Asyncs
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

  /*
    Listen for queue messages every 10 seconds
  */
  let interval;
  if (Deno.env.get("DENO_ENV") !== "test") {
    // TODO: emit event when unhealthy, so core can reload this adapter
    interval = setInterval(
      () =>
        processTasks(svcName, asyncFetch, {
          getQueueUrl,
          receiveMessage,
          deleteMessage,
          putObject,
          deleteObject,
        })
          .fork(
            (e) => console.log("error processing jobs: ", e.msg || e.message),
            (r) => console.log("processed jobs: ", r),
          ),
      10 * 1000,
    );
  }

  return Object.freeze({
    cleanup: () => interval && clearInterval(interval),
    // list queues
    index: () =>
      getObject(svcName, QUEUES).map(keys).bichain(
        handleHyperErr,
        Async.Resolved,
      ).toPromise(),
    // create queue
    create: ({ name, target, secret }) => {
      return Async.all([
        createBucket(svcName),
        createQueue(svcName),
      ])
        .chain(() => getObject(svcName, QUEUES))
        .bichain(
          (err) =>
            err.message.includes("NoSuchKey")
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
        //.map(result => (console.log('result: ', result), result))
        .map(() => ({ ok: true }))
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
              .map(() => ({ ok: true }));
          }
          return Async.Resolved({ ok: true });
        })
        .bichain(
          handleHyperErr,
          Async.Resolved,
        )
        .toPromise(),
    // cancel job
    cancel: ({ name, id }) =>
      deleteObject(svcName, `${name}/${id}`)
        .map(() => ({ ok: true }))
        .bichain(
          handleHyperErr,
          Async.Resolved,
        )
        .toPromise(),
  });

  function postJob(queue) {
    return (msg) =>
      getQueueUrl(svcName)
        .chain((url) => sendMessage(url, msg))
        .map(({ MessageId }) => ({
          ok: true,
          id: MessageId,
          msg: assoc("status", READY, msg),
        }))
        .chain((result) =>
          putObject(svcName, `${queue}/${result.id}`, result.msg).map(() =>
            result
          )
        );
  }
  function includeDocs(keys) {
    return Async.all(
      map(
        (key) => getObject(svcName, key),
        keys,
      ),
    );
  }
}
