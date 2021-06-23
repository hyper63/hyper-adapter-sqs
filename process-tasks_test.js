import "https://deno.land/x/dotenv@v2.0.0/load.ts";
import { crocks, R } from "./deps.js";
import { assertEquals } from "./deps_dev.js";

import * as aws from "./aws-mock.js";
import processTasks from "./process-tasks.js";

const { Async } = crocks;
const test = Deno.test;

const putObject = R.curry(function (a, b, c) {
  return Async.fromPromise(aws.putObject)(a, b, c);
});
const getQueueUrl = Async.fromPromise(aws.getQueueUrl);
const deleteObject = Async.fromPromise(aws.deleteObject);
const deleteMessage = Async.fromPromise(aws.deleteMessage);

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
