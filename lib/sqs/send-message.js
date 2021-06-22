import { ApiFactory, SQS } from "../../deps.js";

export default function (url, message) {
  const factory = new ApiFactory();
  const sqs = new SQS(factory);
  return sqs.sendMessage({
    QueueUrl: url,
    MessageBody: JSON.stringify(message),
  });
}
