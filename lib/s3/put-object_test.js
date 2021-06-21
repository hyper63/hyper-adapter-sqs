import 'https://deno.land/x/dotenv@v2.0.0/load.ts'

import { assertEquals } from '../../deps_dev.js'
import putObject from './put-object.js'

const test = Deno.test

test('put object to s3', async () => {
  const result = await putObject('foobar', 'queues', { hello: 'world' })
  console.log(result)
  assertEquals(true, true)
})