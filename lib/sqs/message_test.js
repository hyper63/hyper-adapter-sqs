import "https://deno.land/x/dotenv@v3.1.0/load.ts";
import { ApiFactory, R, SQS } from "../../deps.js";
import { assertEquals } from "../../deps_dev.js";
import sendMessage from "./send-message.js";
import getQueueUrl from "./get-queue-url.js";
import receiveMessage from "./receive-message.js";
import deleteMessage from "./delete-message.js";

const test = Deno.test;

test("send, receive and delete message to queue", async () => {
  const sqs = new SQS(new ApiFactory());
  const url = await getQueueUrl("foobar").runWith(sqs);
  const msg = await sendMessage(url, {
    queue: "foo",
    body: { hello: "world" },
  }).runWith(sqs);
  assertEquals(R.has("MessageId", msg), true);

  const msgs = await receiveMessage(url, 1).runWith(sqs);
  console.log(msgs);
  assertEquals(msgs.length, 1);

  const result = await deleteMessage(url, msgs[0].ReceiptHandle).runWith(sqs);
  assertEquals(result.ok, true);
});
