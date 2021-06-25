import "https://deno.land/x/dotenv@v2.0.0/load.ts";

import * as aws from "./aws-mock.js";
//import * as aws from './aws.js'

import { assertEquals } from "./deps_dev.js";
import { adapter } from "./adapter.js";

const test = Deno.test;
const a = adapter("foobar", aws);

test("create/delete queue", async () => {
  const result = await a.create({
    name: "baz",
    target: "https://example.com",
    secret: "secret",
  });
  assertEquals(result.ok, true);

  // tear down
  const cleanup = await a.delete("baz");
  assertEquals(cleanup.ok, true);
});

test("post a job to queue", async () => {
  // setup
  const x = await a.create({
    name: "test",
    target: "https://jsonplaceholder.typicode.com/posts",
  });
  //console.log('x', x)
  // post job
  const result = await a.post({ name: "test", job: { hello: "world" } });
  assertEquals(result.ok, true);

  // tear down
  await a.delete("test");
});

test("get error jobs from the queue", async () => {
  // setup
  await a.create({
    name: "test2",
    target: "https://jsonplaceholder.typicode.com/posts",
  });

  // test
  const result = await a.get({ name: "test2", status: "ERROR" });
  assertEquals(result.ok, true);

  // tear down
  await a.delete("test2");
});

test("retry an errored job from the queue", async () => {
  // setup
  await a.create({
    name: "test2",
    target: "https://jsonplaceholder.typicode.com/posts",
  });

  // test
  const result = await a.retry({ name: "test2", id: "1" });
  assertEquals(result.ok, true);

  // tear down
  await a.delete("test2");
});

test("cancel errored job from the queue", async () => {
  // setup
  await a.create({
    name: "test2",
    target: "https://jsonplaceholder.typicode.com/posts",
  });

  // test
  const result = await a.cancel({ name: "test2", id: "1" });
  assertEquals(result.ok, true);

  // tear down
  await a.delete("test2");
});
