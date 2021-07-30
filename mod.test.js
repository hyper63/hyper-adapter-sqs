import { assert, assertEquals, validateFactorySchema } from "./deps_dev.js";

import createFactory from "./mod.js";

const { test } = Deno;

// TODO: probably a better way to do this
console.log = () => {};

test("should be a valid schema", () => {
  const factory = createFactory("foo");
  assert(validateFactorySchema(factory));
});

test("load - should return the object", () => {
  const factory = createFactory("foo");
  const res = factory.load();

  assert(res.name);
  assert(res.factory);
  assert(res.aws);
  assert(res.aws.s3);
  assert(res.aws.sqs);
});

test("load - should use provided credentials", async () => {
  const res = createFactory("foo", {
    awsAccessKeyId: "foo",
    awsSecretKey: "bar",
    region: "fizz",
  }).load();

  await res.factory.ensureCredentialsAvailable();

  assert(true);
});

test("load - should use credentials passed to load", async () => {
  const res = createFactory("foo").load({
    awsAccessKeyId: "foo",
    awsSecretKey: "bar",
    region: "fizz",
  });

  await res.factory.ensureCredentialsAvailable();
  assert(true);
});

test("load - should merge credentials, preferring those passed to adapter", async () => {
  const res = createFactory("foo", { awsAccessKeyId: "better-id" }).load({
    awsAccessKeyId: "foo",
    awsSecretKey: "bar",
    region: "fizz",
  });

  await res.factory.ensureCredentialsAvailable();

  assertEquals(res.awsAccessKeyId, "better-id");
  assertEquals(res.awsSecretKey, "bar");
  assertEquals(res.region, "fizz");
});

test("load - should default the region to us-east-1", async () => {
  const res = createFactory("foo").load({
    awsAccessKeyId: "foo",
    awsSecretKey: "bar",
  });

  await res.factory.ensureCredentialsAvailable();

  assertEquals(res.region, "us-east-1");
});
