// deno-lint-ignore-file
import "https://deno.land/x/dotenv@v3.1.0/load.ts";
import { crocks, R } from "./deps.js";
import { assert, assertEquals } from "./deps_dev.js";

import aws from "./aws-mock.js";
import processTasks from "./process-tasks.js";
import { computeSignature } from "./lib/utils.js";

const { s3, sqs } = aws;
const { Async } = crocks;
const test = Deno.test;

const putObject = R.curry(function (a, b, c) {
  return Async.fromPromise(s3.putObject)(a, b, c);
});
const getQueueUrl = Async.fromPromise(sqs.getQueueUrl);
const deleteObject = Async.fromPromise(s3.deleteObject);
const deleteMessage = Async.fromPromise(sqs.deleteMessage);

let asyncFetch;
let receiveMessage = (url, count) =>
  Async.Resolved([{
    MessageId: "1",
    ReceiptHandle: "1",
    Body:
      '{"queue": "test", "target": "https://jsonplaceholder.typicode.com/posts", "job": {"hello": "world"}}',
  }]);

test("receive messages", async () => {
  asyncFetch = (target, options) => {
    assertEquals(target, "https://jsonplaceholder.typicode.com/posts");
    assertEquals(JSON.parse(options.body).hello, "world");

    // no signature because no secret provided
    assert(!options.headers["X_HYPER_SIGNATURE"]);

    return Async.Resolved({ ok: true });
  };

  const result = await processTasks("foobar", asyncFetch, {
    getQueueUrl,
    receiveMessage,
    deleteMessage,
    putObject,
    deleteObject,
  })
    .toPromise();
  assertEquals(result[0].ok, true);
});

test("computes a signature", async () => {
  receiveMessage = () =>
    Async.Resolved([{
      MessageId: "1",
      ReceiptHandle: "1",
      Body:
        '{"queue": "test", "target": "https://jsonplaceholder.typicode.com/posts", "secret": "foobar", "job": {"hello": "world"}}',
    }]);

  asyncFetch = (target, options) => {
    const header = options.headers["X-HYPER-SIGNATURE"];
    assert(header);

    const [first, second] = header.split(",");
    assert(first);
    assert(second);

    const [, time] = first.split("t=");
    const [, sig] = second.split("sig=");

    assert(time);
    assert(sig);

    assertEquals(
      sig,
      computeSignature("foobar", JSON.parse(options.body), time),
    );

    return Async.Resolved({ ok: true });
  };

  const result = await processTasks("foobar", asyncFetch, {
    getQueueUrl,
    receiveMessage,
    deleteMessage,
    putObject,
    deleteObject,
  })
    .toPromise();
  assertEquals(result[0].ok, true);
});
