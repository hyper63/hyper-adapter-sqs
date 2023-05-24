import { ask, prop } from '../utils.js'

export default (name) =>
  ask((sqs) =>
    sqs.getQueueUrl({
      QueueName: `hyper-queue-${name}`,
    }).then(prop('QueueUrl'))
  )
