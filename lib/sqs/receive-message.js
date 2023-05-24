import { ask, prop } from '../utils.js'

export default (url, count) =>
  ask((sqs) =>
    sqs.receiveMessage({
      QueueUrl: url,
      MaxNumberOfMessages: count,
    }).then(prop('Messages'))
  )
