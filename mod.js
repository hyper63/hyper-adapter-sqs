
import { adapter } from './adapter.js'
import createBucket from './lib/s3/create-bucket.js'
import createQueue from './lib/sqs/create-queue.js'
import putObject from './lib/s3/put-object.js'
import getObject from './lib/s3/get-object.js'
import deleteObject from './lib/s3/delete-object.js'
import deleteQueue from './lib/sqs/delete-queue.js'
import deleteBucket from './lib/s3/delete-bucket.js'
import sendMessage from './lib/sqs/send-message.js'
import receiveMessage from './lib/sqs/receive-message.js'

/**
 * @param {string} svcName - name of queue service
 */
export default function sqsAdapter(svcName) {
  const aws = {
    createBucket, createQueue, putObject,
    getObject, deleteObject, deleteQueue, deleteBucket,
    sendMessage, receiveMessage
  }
  return Object.freeze({
    id: 'sqs',
    port: 'queue',
    load: () => svcName,
    link: env => () => adapter(env, aws)
  })
}