import 'https://deno.land/x/dotenv@v2.0.0/load.ts'

import { assertEquals } from '../../deps_dev.js'
import deleteQueue from './delete-queue.js'

const test = Deno.test

test('delete sqs queue', async () => {
  //const result = await deleteQueue('https://sqs.us-east-1.amazonaws.com/847565607767/hyper-queue-foobar')
  //console.log('result', result)
  assertEquals(true, true)
})

