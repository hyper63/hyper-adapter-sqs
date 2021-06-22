import 'https://deno.land/x/dotenv@v2.0.0/load.ts'

import * as aws from './aws-mock.js'
/*
import createBucket from './lib/s3/create-bucket.js'
import createQueue from './lib/sqs/create-queue.js'
import getObject from './lib/s3/get-object.js'
import putObject from './lib/s3/put-object.js'
*/
/*
import deleteObject from './lib/s3/delete-object.js'
import deleteQueue from './lib/sqs/delete-queue.js'
import deleteBucket from './lib/s3/delete-bucket.js'
import sendMessage from './lib/sqs/send-message.js'
import receiveMessage from './lib/sqs/receive-message.js'
import deleteMessage from './lib/sqs/delete-message.js'
*/
import { assertEquals } from './deps_dev.js'
import { adapter } from './adapter.js'

const test = Deno.test
/*
const aws = {
  createBucket, createQueue, getObject, putObject
  deleteObject,
  deleteQueue, deleteBucket, sendMessage, receiveMessage, deleteMessage
  
}
*/

const a = adapter('foobar', aws)

test('create queue', async () => {
  const result = await a.create({
    name: 'baz',
    target: 'https://example.com',
    secret: 'secret'
  })
  assertEquals(result.ok, true)
})