// deno-lint-ignore-file
import "https://deno.land/x/dotenv@v2.0.0/load.ts";
import { crocks, R } from "./deps.js";
import { assertEquals } from "./deps_dev.js";

import aws from "./aws-mock.js";
import processTasks from "./process-tasks.js";

const { s3, sqs } = aws;
const { Async } = crocks;
const test = Deno.test;

const putObject = R.curry(function (a, b, c) {
  return Async.fromPromise(s3.putObject)(a, b, c);
});
const getQueueUrl = Async.fromPromise(sqs.getQueueUrl);
const deleteObject = Async.fromPromise(s3.deleteObject);
const deleteMessage = Async.fromPromise(sqs.deleteMessage);

const asyncFetch = (target, options) => Async.Resolved({ ok: true });
const receiveMessage = (url, count) =>
  Async.Resolved([{
    MessageId: "1",
    ReceiptHandle: "1",
    Body:
      '{"queue": "test", "target": "https://jsonplaceholder.typicode.com/posts", "job": {"hello": "world"}}',
  }]);

test("receive messages", async () => {
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
