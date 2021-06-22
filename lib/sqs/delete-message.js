import { ApiFactory, SQS } from '../../deps.js'

export default function (url, handle) {
  const factory = new ApiFactory()
  const sqs = new SQS(factory)
  return sqs.deleteMessage({
    QueueUrl: url,
    ReceiptHandle: handle
  }).then(() => ({ ok: true }))

}