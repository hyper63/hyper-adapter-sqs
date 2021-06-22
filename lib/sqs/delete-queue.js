import { ApiFactory, SQS } from "../../deps.js";

export default function (queueUrl) {
  const factory = new ApiFactory();
  const sqs = new SQS(factory);
  return sqs.deleteQueue({
    QueueUrl: queueUrl,
  })
    .then(() => ({ ok: true }));
}
