import "https://deno.land/x/dotenv@v2.0.0/load.ts";

import { assertEquals } from "../../deps_dev.js";
import getObject from "./get-object.js";

const test = Deno.test;

test("get object from s3", async () => {
  const result = await getObject("foobar", "queues");
  console.log(result);
  assertEquals(true, true);
});

test("get object from s3", async () => {
  const result = await getObject("foobar", "test/16613e7e-2331-4c7a-bf37-fe5861f2abe9");
  console.log(result);
  assertEquals(true, true);
});
