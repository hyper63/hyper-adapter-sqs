import "https://deno.land/x/dotenv@v3.1.0/load.ts";

import { assertEquals } from "../../dev_deps.js";
import { ApiFactory, SQS } from "../../deps.js";
import getQueueUrl from "./get-queue-url.js";

const test = Deno.test;

test("get queue url", async () => {
  const sqs = new SQS(new ApiFactory());
  const result = await getQueueUrl("foobar").runWith(sqs);
  assertEquals(result.includes("hyper-queue-foobar"), true);
});
