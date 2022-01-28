import "https://deno.land/x/dotenv@v3.1.0/load.ts";

import { assertEquals } from "../../deps_dev.js";
import { ApiFactory, S3 } from "../../deps.js";
import createS3Bucket from "./create-bucket.js";

const test = Deno.test;

test("create s3 Bucket", async () => {
  const s3 = new S3(new ApiFactory());
  const result = await createS3Bucket("foobar").runWith(s3);
  assertEquals(result, "/hyper-queue-foobar");
});
