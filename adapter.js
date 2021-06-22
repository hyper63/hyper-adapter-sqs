import { crocks, R } from "./deps.js";

const { Async } = crocks;
const { all, assoc, dissoc, equals, identity, keys, map, pluck, prop } = R;

const noop = () => Promise.resolve({ ok: false, msg: "Not Implemented" });

export function adapter(svcName, aws) {
  // wrap aws functions into Asyncs
  const createBucket = Async.fromPromise(aws.createBucket);
  const createQueue = Async.fromPromise(aws.createQueue);
  const getObject = Async.fromPromise(aws.getObject);
  const putObject = R.curry(function (a, b, c) {
    return Async.fromPromise(aws.putObject)(a, b, c);
  });
  const getQueueUrl = Async.fromPromise(aws.getQueueUrl);
  const deleteQueue = Async.fromPromise(aws.deleteQueue);
  const deleteBucket = Async.fromPromise(aws.deleteBucket);
  const deleteObject = Async.fromPromise(aws.deleteObject);
  const sendMessage = Async.fromPromise(aws.sendMessage);
  const receiveMessage = Async.fromPromise(aws.receiveMessage);
  const asyncFetch = Async.fromPromise(fetch);
  const deleteMessage = Async.fromPromise(aws.deleteMessage);

  /*
    Listen for queue messages every 10 seconds
  */
  if (Deno.env.get("DENO_ENV") !== "test") {
    setInterval(() =>
      getQueueUrl(svcName)
        .chain((url) => receiveMessage(url, 10))
        // post messages to target
        .chain((msgs) => Async.all(map(postMessages(svcName), msgs)))
        .fork(
          (e) => console.log("error: ", e.message),
          (r) => console.log("r", r),
        ), 10 * 1000);
  }

  return Object.freeze({
    // list queues
    index: getObject(svcName, "queues").map(keys).toPromise(),
    // create queue
    create: ({ name, target, secret }) => {
      return Async.of(svcName)
        .chain((svcName) =>
          Async.all([
            createBucket(svcName),
            createQueue(svcName),
          ])
        )
        .chain(() => getObject(svcName, "queues"))
        .bichain(
          (err) =>
            err.message.includes("NoSuchKey")
              ? putObject(svcName, "queues", {}).map(() => ({}))
              : Async.Rejected(err),
          Async.Resolved,
        )
        .map(assoc(name, { target, secret }))
        .chain(putObject(svcName, "queues"))
        .toPromise();
    },
    // delete queue
    delete: (name) =>
      getObject(svcName, "queues")
        .map(dissoc(name))
        .chain((queues) =>
          // remove parent queue and bucket if no more queues defined
          keys(queues).length === 0
            ? deleteObject(svcName, "queues")
              .chain(() =>
                Async.all([
                  getQueueUrl(svcName).chain(deleteQueue),
                  deleteBucket(svcName),
                ])
              )
              .map((results) => ({
                ok: all(equals(true), pluck("ok", results)),
              }))
            : putObject(svcName, "queues", queues)
        )
        .toPromise(),
    // post job
    post: ({ name, job }) =>
      getObject(svcName, "queues")
        .map(prop(name))
        .map(assoc("queue", name))
        .map(assoc("job", job))
        .chain((msg) =>
          getQueueUrl(svcName)
            .chain((url) => sendMessage(url, msg))
            .map(({ MessageId }) => ({ ok: true, id: MessageId }))
        )
        .toPromise(),
    // get jobs
    get: noop,
    // retry job
    retry: noop,
    // cancel job
    cancel: noop,
  });

  function postMessages(svcName) {
    return ({ Body, ReceiptHandle }) =>
      Async.of(Body)
        .map((msg) => JSON.parse(msg))
        // send to target
        .chain(({ target, secret, job }) =>
          asyncFetch(target, {
            method: "POST",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify(job),
          })
        )
        // delete from queue
        .chain(() =>
          getQueueUrl(svcName)
            .chain((url) => deleteMessage(url, ReceiptHandle))
        );
  }
}
