import "https://deno.land/x/dotenv@v2.0.0/load.ts";
import { R } from "../../deps.js";
import { assertEquals } from "../../deps_dev.js";
import sendMessage from "./send-message.js";
import getQueueUrl from "./get-queue-url.js";
import receiveMessage from "./receive-message.js";
import deleteMessage from "./delete-message.js";

const test = Deno.test;

test("send, receive and delete message to queue", async () => {
  const url = await getQueueUrl("foobar");
  const msg = await sendMessage(url, {
    queue: "foo",
    body: { hello: "world" },
  });
  assertEquals(R.has("MessageId", msg), true);

  const msgs = await receiveMessage(url, 1);
  console.log(msgs);
  assertEquals(msgs.length, 1);

  const result = await deleteMessage(url, msgs[0].ReceiptHandle);
  assertEquals(result.ok, true);
});
