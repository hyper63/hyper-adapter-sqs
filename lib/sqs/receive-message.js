import { ApiFactory, R, SQS } from "../../deps.js";

const { prop } = R;

export default function (url, count) {
  const factory = new ApiFactory();
  const sqs = new SQS(factory);
  return sqs.receiveMessage({
    QueueUrl: url,
    MaxNumberOfMessages: count,
  })
    .then(prop("Messages"));
}
