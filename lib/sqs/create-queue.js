import { ask, prop } from '../utils.js'

export default (name) =>
  ask((sqs) =>
    sqs.createQueue({
      QueueName: `hyper-queue-${name}`,
    }).then(prop('QueueUrl'))
  )
