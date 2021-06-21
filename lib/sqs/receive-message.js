import { ApiFactory, SQS } from '../deps.js'

export default function (url, count) {
  const factory = new ApiFactory()
  const sqs = new SQS(factory)
  return sqs.receiveMessage({
    QueueUrl: url,
    MaxNumberOfMessages: count
  })

}