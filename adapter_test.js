import { assertEquals } from './deps_dev.js'
import { adapter } from './adapter.js'

const test = Deno.test
const a = adapter({
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY
})

test('index queue', () => {
  const result = await a.index()
  assertEquals(result.ok, true)
})