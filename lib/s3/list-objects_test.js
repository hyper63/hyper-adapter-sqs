import "https://deno.land/x/dotenv@v3.1.0/load.ts";

import { assertEquals } from "../../deps_dev.js";
import { ApiFactory, S3 } from "../../deps.js";
import listObjects from "./list-objects.js";

const test = Deno.test;

test("get object from s3", async () => {
  const s3 = new S3(new ApiFactory());
  const result = await listObjects("foobar", "test").runWith(s3);
  assertEquals(result.length, 1);
});
