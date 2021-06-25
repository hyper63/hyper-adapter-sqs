import { crocks, R } from "./deps.js";

const { __, always, assoc, compose, ifElse, isNil, map } = R;
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
  const getHeaders = ifElse(
    isNil,
    always(headers),
    assoc("X-CSRF-TOKEN", __, headers),
  );

  function postMessages(svcName) {
    return ({ MessageId, Body, ReceiptHandle }) =>
      Async.of(Body)
        .map((msg) => JSON.parse(msg))
        // send to target
        .chain(({ target, secret, job }) =>
          asyncFetch(target, {
            method: "POST",
            headers: getHeaders(secret),
            body: JSON.stringify(job),
          })
            .chain((res) => {
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
            })
        )
        // delete from queue
        .chain(() =>
          getQueueUrl(svcName)
            .chain((url) => deleteMessage(url, ReceiptHandle))
        );
  }

  return getQueueUrl(svcName)
    .chain((url) => receiveMessage(url, 10))
    // post messages to target
    .chain((msgs) => Async.all(map(postMessages(svcName), msgs)));
}
