import 'https://deno.land/x/dotenv@v3.1.0/load.ts'

import { assertEquals } from '../../dev_deps.js'
import { ApiFactory, S3 } from '../../deps.js'
import getObject from './get-object.js'

const test = Deno.test

test('get object from s3', async () => {
  const s3 = new S3(new ApiFactory())
  const result = await getObject('foobar', 'queues').runWith(s3)
  console.log(result)
  assertEquals(
    result.test.target,
    'https://jsonplaceholder.typicode.com/posts',
  )
})

test('get object from s3', async () => {
  const s3 = new S3(new ApiFactory())
  const result = await getObject(
    'foobar',
    'test/16613e7e-2331-4c7a-bf37-fe5861f2abe9',
  ).runWith(s3)
  console.log(result)
  assertEquals(result.queue, 'test')
})
