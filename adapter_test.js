import "https://deno.land/x/dotenv@v3.1.0/load.ts";

import aws from "./aws-mock.js";
//import aws from './aws.js'

import { assertEquals } from "./deps_dev.js";
import { adapter } from "./adapter.js";
import { tokenErrs } from "./lib/utils.js";

const test = Deno.test;
const a = adapter({ name: "foobar", aws });

test("* - should map AWS Token errors to HyperErr", async () => {
  const original = aws.s3.getObject;

  await Promise.all(
    tokenErrs.map(async (te) => {
      aws.s3.getObject = () => Promise.reject(new Error(`${te} - found`));
      const a = adapter({ name: "foobar", aws });
      await a.index().then((res) => {
        assertEquals(res.ok, false);
        assertEquals(res.status, 500);
      });
    }),
  );

  aws.s3.getObject = original;
});

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

test("don't create bucket if it exist", async () => {
  let createCalled = false;
  const original = aws.s3.checkBucket;
  const originalCreateBucket = aws.s3.createBucket;
  aws.s3.checkBucket = () => Promise.resolve(); // bucket already exists
  aws.s3.createBucket = (name) => {
    createCalled = true;
    return originalCreateBucket(name);
  };

  const a = adapter({ name: "foobar", aws });

  const result = await a.create({
    name: "baz",
    target: "https://example.com",
    secret: "secret",
  });
  assertEquals(result.ok, true);
  assertEquals(false, createCalled); // create should not be called

  // tear down
  const cleanup = await a.delete("baz");
  assertEquals(cleanup.ok, true);
  aws.s3.checkBucket = original;
  aws.s3.createBucket = originalCreateBucket;
});

test("post a job to queue", async () => {
  // setup
  await a.create({
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
