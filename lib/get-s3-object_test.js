import 'https://deno.land/x/dotenv@v2.0.0/load.ts'

import { assertEquals } from '../deps_dev.js'
import getObject from './get-s3-object.js'

const test = Deno.test

test('get object from s3', async () => {
  const result = await getObject('foobar', 'queues')
  console.log(result)
  assertEquals(true, true)
})