import 'https://deno.land/x/dotenv@v3.1.0/load.ts'

import { assertEquals } from '../../dev_deps.js'
import { ApiFactory, S3 } from '../../deps.js'
import deleteBucket from './delete-bucket.js'

const test = Deno.test

test('delete bucket from s3', async () => {
  const s3 = new S3(new ApiFactory())
  const result = await deleteBucket('foobar').runWith(s3)
  console.log(result)
  assertEquals(result.ok, true)
})
