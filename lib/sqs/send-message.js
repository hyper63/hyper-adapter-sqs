import { ask } from '../utils.js'

export default (url, message) =>
  ask((sqs) =>
    sqs.sendMessage({
      QueueUrl: url,
      MessageBody: JSON.stringify(message),
    })
  )
