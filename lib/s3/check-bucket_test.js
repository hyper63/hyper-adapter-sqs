import "https://deno.land/x/dotenv@v3.1.0/load.ts";

import { assert } from "../../deps_dev.js";
import { ApiFactory, S3 } from "../../deps.js";
import checkBucket from "./check-bucket.js";

const test = Deno.test;

test("check s3 Bucket exists", async () => {
  const s3 = new S3(new ApiFactory());
  const result = await checkBucket("foobar").runWith(s3);
  assert(result);
});
