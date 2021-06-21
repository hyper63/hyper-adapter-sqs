import 'https://deno.land/x/dotenv@v2.0.0/load.ts'

import { assertEquals } from '../../deps_dev.js'
import deleteObject from './delete-object.js'

const test = Deno.test

test('delete object from s3', async () => {
  const result = await deleteObject('foobar', 'queues')
  console.log(result)
  assertEquals(true, true)
})