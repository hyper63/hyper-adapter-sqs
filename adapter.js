import { crocks, R } from "./deps.js";
import { toHyperErr } from "./lib/utils.js";
import processTasks from "./process-tasks.js";

const { Async } = crocks;
const {
  all,
  assoc,
  dissoc,
  equals,
  filter,
  identity,
  keys,
  map,
  pluck,
  prop,
  propEq,
} = R;

const [ERROR, READY, QUEUES] = ["ERROR", "READY", "QUEUES"];

export function adapter({ name, aws: { s3, sqs } }) {
  const svcName = name;
  // wrap aws functions into Asyncs
  const createBucket = Async.fromPromise(s3.createBucket);
  const createQueue = Async.fromPromise(sqs.createQueue);
  const getObject = Async.fromPromise(s3.getObject);
  const putObject = R.curry(function (a, b, c) {
    return Async.fromPromise(s3.putObject)(a, b, c);
  });
  const getQueueUrl = Async.fromPromise(sqs.getQueueUrl);
  const deleteQueue = Async.fromPromise(sqs.deleteQueue);
  const deleteBucket = Async.fromPromise(s3.deleteBucket);
  const deleteObject = Async.fromPromise(s3.deleteObject);
  const sendMessage = Async.fromPromise(sqs.sendMessage);
  const receiveMessage = Async.fromPromise(sqs.receiveMessage);
  const asyncFetch = Async.fromPromise(fetch);
  const deleteMessage = Async.fromPromise(sqs.deleteMessage);
  const listObjects = Async.fromPromise(s3.listObjects);
  /*
    Listen for queue messages every 10 seconds
  */
  if (Deno.env.get("DENO_ENV") !== "test") {
    setInterval(
      () =>
        processTasks(svcName, asyncFetch, {
          getQueueUrl,
          receiveMessage,
          deleteMessage,
          putObject,
          deleteObject,
        })
          .fork(
            (e) => console.log("error processing jobs: ", e.message),
            (r) => console.log("processed jobs: ", r),
          ),
      10 * 1000,
    );
  }

  return Object.freeze({
    // list queues
    index: () =>
      getObject(svcName, QUEUES).map(keys).bimap(
        toHyperErr,
        identity,
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
        .bimap(
          toHyperErr,
          identity,
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
        .bimap(
          toHyperErr,
          identity,
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
        .bimap(
          toHyperErr,
          identity,
        )
        .toPromise(),
    // get jobs
    get: ({ name, status }) =>
      listObjects(svcName, name)
        .chain(includeDocs)
        .map(filter(propEq("status", status)))
        .map((jobs) => ({ ok: true, jobs, status }))
        .bimap(
          toHyperErr,
          identity,
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
        .bimap(
          toHyperErr,
          identity,
        )
        .toPromise(),
    // cancel job
    cancel: ({ name, id }) =>
      deleteObject(svcName, `${name}/${id}`)
        .map(() => ({ ok: true }))
        .bimap(
          toHyperErr,
          identity,
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
