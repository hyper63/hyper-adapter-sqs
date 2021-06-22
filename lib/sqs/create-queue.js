import { ApiFactory, R, SQS } from "../../deps.js";

export default function (name) {
  const factory = new ApiFactory();
  const sqs = new SQS(factory);
  return sqs.createQueue({
    QueueName: `hyper-queue-${name}`,
  }).then(R.prop("QueueUrl"));
}
