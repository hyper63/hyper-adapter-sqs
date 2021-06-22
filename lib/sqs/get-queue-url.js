import { ApiFactory, R, SQS } from "../../deps.js";

const { prop } = R;

export default function (name) {
  const factory = new ApiFactory();
  const sqs = new SQS(factory);
  return sqs.getQueueUrl({
    QueueName: `hyper-queue-${name}`,
  }).then(prop("QueueUrl"));
}
