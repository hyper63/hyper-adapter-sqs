import "https://deno.land/x/dotenv@v3.1.0/load.ts";

import { assertEquals } from "../../deps_dev.js";
import { ApiFactory, S3 } from "../../deps.js";

import putObject from "./put-object.js";

const test = Deno.test;

test("put object to s3", async () => {
  const s3 = new S3(new ApiFactory());
  const result = await putObject("foobar", "queues", { hello: "world" })
    .runWith(s3);
  console.log(result);
  assertEquals(result.ok, true);
});
