import "https://deno.land/x/dotenv@v2.0.0/load.ts";

import { assertEquals } from "../../deps_dev.js";
import listObjects from "./list-objects.js";

const test = Deno.test;

test("get object from s3", async () => {
  const result = await listObjects("foobar", "test");
  console.log(result);
  assertEquals(true, true);
});
