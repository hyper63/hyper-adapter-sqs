import { assert, assertEquals, validateFactorySchema } from "./deps_dev.js";

import createFactory from "./mod.js";

const { test } = Deno;

// TODO: probably a better way to do this
console.log = () => {};

test("mod", async (t) => {
  await t.step("should be a valid schema", () => {
    const factory = createFactory("foo");
    assert(validateFactorySchema(factory));
  });

  await t.step("load", async (t) => {
    await t.step("load - should return the object", () => {
      const factory = createFactory("foo");
      const res = factory.load();

      assert(res.name);
      assert(res.factory);
      assert(res.aws);
      assert(res.aws.s3);
      assert(res.aws.sqs);
    });

    await t.step("load - should use provided options", async () => {
      const res = createFactory("foo", {
        sleep: 1000,
        concurrency: 15,
        awsAccessKeyId: "foo",
        awsSecretKey: "bar",
        region: "fizz",
      }).load();

      await res.factory.ensureCredentialsAvailable();

      assert(true);
      assertEquals(res.sleep, 1000);
      assertEquals(res.concurrency, 15);
    });

    await t.step("load - should use options passed to load", async () => {
      const res = createFactory("foo").load({
        sleep: 1000,
        awsAccessKeyId: "foo",
        awsSecretKey: "bar",
        region: "fizz",
      });

      await res.factory.ensureCredentialsAvailable();
      assert(true);
      assertEquals(res.sleep, 1000);
    });

    await t.step(
      "load - should merge options, preferring those passed to adapter",
      async () => {
        const res = createFactory("foo", {
          sleep: 1000,
          awsAccessKeyId: "better-id",
        })
          .load({
            sleep: 2000,
            awsAccessKeyId: "foo",
            awsSecretKey: "bar",
            region: "fizz",
          });

        await res.factory.ensureCredentialsAvailable();

        assertEquals(res.name, "foo");
        assertEquals(res.awsAccessKeyId, "better-id");
        assertEquals(res.sleep, 1000);
        assertEquals(res.awsSecretKey, "bar");
        assertEquals(res.region, "fizz");
      },
    );

    await t.step("load - should default the region to us-east-1", async () => {
      const res = createFactory("foo").load({
        awsAccessKeyId: "foo",
        awsSecretKey: "bar",
      });

      await res.factory.ensureCredentialsAvailable();

      assertEquals(res.region, "us-east-1");
    });

    await t.step("load - should default the sleep to 10000", () => {
      const res = createFactory("foo").load();
      assertEquals(res.sleep, 10000);
    });

    await t.step("load - should default the concurrency to 20", () => {
      const res = createFactory("foo").load();
      assertEquals(res.concurrency, 20);
    });
  });
});
