import "https://deno.land/x/dotenv@v3.1.0/load.ts";

import aws from "./aws-mock.js";
//import aws from './aws.js'

import { assert, assertEquals } from "./deps_dev.js";
import { adapter } from "./adapter.js";
import { tokenErrs } from "./lib/utils.js";

const test = Deno.test;
const a = adapter({ name: "foobar", aws });

test("adapter", async (t) => {
  await t.step("* - should map AWS Token errors to HyperErr", async () => {
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

  await t.step("create/delete queue", async () => {
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

  await t.step("don't create bucket if it exist", async () => {
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

  await t.step("post a job to queue", async () => {
    // setup
    await a.create({
      name: "test",
      target: "https://jsonplaceholder.typicode.com/posts",
    });
    // post job
    const result = await a.post({ name: "test", job: { hello: "world" } });
    assertEquals(result.ok, true);
    assert(result.id);

    // tear down
    await a.delete("test");
  });

  await t.step("get error jobs from the queue", async () => {
    // setup
    await a.create({
      name: "test2",
      target: "https://jsonplaceholder.typicode.com/posts",
    });

    //await t.step
    const result = await a.get({ name: "test2", status: "ERROR" });
    assertEquals(result.ok, true);

    // tear down
    await a.delete("test2");
  });

  await t.step("processed job race condition is handled", async () => {
    const originalGetObject = aws.s3.getObject;
    const originalListObjects = aws.s3.listObjects;

    aws.s3.getObject = (_, name) => {
      if (name.includes("not-found")) {
        const err = new Error("NoSuchKey - woops");
        err.code = "NoSuchKey";
        return Promise.reject(err);
      }

      return Promise.resolve({ key: name, status: "READY" });
    };

    aws.s3.listObjects = () =>
      Promise.resolve(["test2/key-1", "test2/not-found"]);
    const a = adapter({ name: "foobar", aws });
    // setup
    await a.create({
      name: "test2",
      target: "https://jsonplaceholder.typicode.com/posts",
    });

    // test
    const result = await a.get({ name: "test2", status: "READY" });
    assertEquals(result.ok, true);
    assertEquals(result.jobs.length, 1);

    // tear down
    await a.delete("test2");
    aws.s3.getObject = originalGetObject;
    aws.s3.listObjects = originalListObjects;
  });

  await t.step("retry an errored job from the queue", async () => {
    // setup
    await a.create({
      name: "test2",
      target: "https://jsonplaceholder.typicode.com/posts",
    });

    // test
    const result = await a.retry({ name: "test2", id: "1" });
    assertEquals(result.ok, true);
    assert(result.id);

    // tear down
    await a.delete("test2");
  });

  await t.step("cancel errored job from the queue", async () => {
    // setup
    await a.create({
      name: "test2",
      target: "https://jsonplaceholder.typicode.com/posts",
    });

    // test
    const result = await a.cancel({ name: "test2", id: "1" });
    assertEquals(result.ok, true);
    assert(result.id);

    // tear down
    await a.delete("test2");
  });
});
