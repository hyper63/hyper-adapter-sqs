import { crocks, HyperErr, R } from "./deps.js";
import { computeSignature, isAwsTokenErr } from "./lib/utils.js";

const { always, assoc, compose, ifElse, isNil, map, identity } = R;
const { Async } = crocks;

export default function (
  svcName,
  asyncFetch,
  { getQueueUrl, receiveMessage, deleteMessage, putObject, deleteObject },
) {
  const setToErrorState = (txt, msg) =>
    compose(
      assoc("status", "ERROR"),
      assoc("error", txt),
    )(msg);

  const headers = {
    "content-type": "application/json",
  };
  const getHeaders = (secret, job) =>
    ifElse(
      isNil,
      always(headers),
      () => {
        const timeInMilli = new Date().getTime().toString();

        return assoc(
          "X-HYPER-SIGNATURE",
          `t=${timeInMilli},sig=${computeSignature(secret, job, timeInMilli)}`,
          headers,
        );
      },
    )(secret);

  function postMessages(svcName) {
    return ({ MessageId, Body, ReceiptHandle }) =>
      Async.of(Body)
        .map((msg) => JSON.parse(msg))
        // send to target
        .chain(({ target, secret, job }) =>
          asyncFetch(target, {
            method: "POST",
            headers: getHeaders(secret, job),
            body: JSON.stringify(job),
          })
            .bichain(
              // Error
              (err) => {
                const msg = JSON.parse(Body);
                return Async.of(
                  JSON.stringify({ msg: err.message, stack: err.stack }),
                )
                  .chain((txt) =>
                    putObject(
                      svcName,
                      `${msg.queue}/${MessageId}`,
                      setToErrorState(txt, msg),
                    )
                  );
              },
              // Response
              (res) => {
                const msg = JSON.parse(Body);
                return res.ok
                  ? deleteObject(svcName, `${msg.queue}/${MessageId}`)
                  : Async.fromPromise(res.text)().chain((txt) =>
                    putObject(
                      svcName,
                      `${msg.queue}/${MessageId}`,
                      setToErrorState(txt, msg),
                    )
                  );
              },
            )
        )
        // delete from sqs queue
        .chain(() =>
          getQueueUrl(svcName)
            .chain((url) => deleteMessage(url, ReceiptHandle))
        );
  }

  return getQueueUrl(svcName)
    .chain((url) => receiveMessage(url, 10))
    // post messages to target
    .chain((msgs) => Async.all(map(postMessages(svcName), msgs)))
    .bimap((err) => {
      if (isAwsTokenErr(err)) {
        return HyperErr({ status: 500, msg: "Invalid AWS Credentials" });
      }

      return { msg: err.message };
    }, identity);
}
