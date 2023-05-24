import 'https://deno.land/x/dotenv@v3.1.0/load.ts'

import { assertEquals } from '../../dev_deps.js'
import { ApiFactory, SQS } from '../../deps.js'
import createQueue from './create-queue.js'

const test = Deno.test

test('create sqs queue', async () => {
  const sqs = new SQS(new ApiFactory())
  const result = await createQueue('foobar').runWith(sqs)
  assertEquals(result.includes('hyper-queue-foobar'), true)
})
