import "https://deno.land/x/dotenv@v2.0.0/load.ts";

import { assertEquals } from "../../deps_dev.js";
import getQueueUrl from "./get-queue-url.js";
import deleteQueue from "./delete-queue.js";

const test = Deno.test;

test("delete sqs queue", async () => {
  const url = await getQueueUrl("foobar");
  const result = await deleteQueue(url);
  assertEquals(result.ok, true);
});
