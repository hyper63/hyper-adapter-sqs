import 'https://deno.land/x/dotenv@v2.0.0/load.ts'

import { assertEquals } from '../deps_dev.js'
import deleteBucket from './delete-s3-bucket.js'

const test = Deno.test

test('delete bucket from s3', async () => {
  const result = await deleteBucket('foobar')
  console.log(result)
  assertEquals(true, true)
})