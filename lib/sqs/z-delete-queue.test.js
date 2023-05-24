import "https://deno.land/x/dotenv@v3.1.0/load.ts";

import { assertEquals } from "../../dev_deps.js";
import { ApiFactory, SQS } from "../../deps.js";
import getQueueUrl from "./get-queue-url.js";
import deleteQueue from "./delete-queue.js";

const test = Deno.test;

test("delete sqs queue", async () => {
  const sqs = new SQS(new ApiFactory());
  const url = await getQueueUrl("foobar").runWith(sqs);
  const result = await deleteQueue(url).runWith(sqs);
  assertEquals(result.ok, true);
});
