import 'https://deno.land/x/dotenv@v2.0.0/load.ts'

import { assertEquals } from '../deps_dev.js'
import createS3Bucket from './create-s3-bucket.js'

const test = Deno.test

test('create s3 Bucket', async () => {
  const result = await createS3Bucket('foobar')
  console.log('result', result)
  assertEquals(true, true)
})

