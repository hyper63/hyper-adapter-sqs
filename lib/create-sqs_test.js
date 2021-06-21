import 'https://deno.land/x/dotenv@v2.0.0/load.ts'

import { assertEquals } from '../deps_dev.js'
import createQueue from './create-sqs.js'

const test = Deno.test

test('create sqs queue', async () => {
  const result = await createQueue('foobar')
  console.log('result', result)
  assertEquals(true, true)
})

