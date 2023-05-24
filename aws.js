import { crocks, S3, SQS } from './deps.js'

import { default as checkBucket } from './lib/s3/check-bucket.js'
import { default as createBucket } from './lib/s3/create-bucket.js'
import { default as createQueue } from './lib/sqs/create-queue.js'
import { default as listObjects } from './lib/s3/list-objects.js'
import { default as getObject } from './lib/s3/get-object.js'
import { default as putObject } from './lib/s3/put-object.js'
import { default as deleteObject } from './lib/s3/delete-object.js'
import { default as deleteQueue } from './lib/sqs/delete-queue.js'
import { default as deleteBucket } from './lib/s3/delete-bucket.js'
import { default as getQueueUrl } from './lib/sqs/get-queue-url.js'
import { default as sendMessage } from './lib/sqs/send-message.js'
import { default as receiveMessage } from './lib/sqs/receive-message.js'
import { default as deleteMessage } from './lib/sqs/delete-message.js'

const { Reader } = crocks
const { of, ask } = Reader

export default of()
  .chain((_) =>
    ask((factory) => ({
      s3: new S3(factory),
      sqs: new SQS(factory),
    }))
  )
  .map(({ s3, sqs }) => ({
    s3: {
      createBucket: (name) => createBucket(name).runWith(s3),
      checkBucket: (name) => checkBucket(name).runWith(s3),
      deleteBucket: (bucket) => deleteBucket(bucket).runWith(s3),
      listObjects: (bucket, folder) => listObjects(bucket, folder).runWith(s3),
      getObject: (bucket, name) => getObject(bucket, name).runWith(s3),
      putObject: (bucket, name, doc) => putObject(bucket, name, doc).runWith(s3),
      deleteObject: (bucket, name) => deleteObject(bucket, name).runWith(s3),
    },
    sqs: {
      createQueue: (name) => createQueue(name).runWith(sqs),
      deleteQueue: (url) => deleteQueue(url).runWith(sqs),
      getQueueUrl: (name) => getQueueUrl(name).runWith(sqs),
      sendMessage: (url, msg) => sendMessage(url, msg).runWith(sqs),
      receiveMessage: (url, count) => receiveMessage(url, count).runWith(sqs),
      deleteMessage: (url, handle) => deleteMessage(url, handle).runWith(sqs),
    },
  }))
