import { assert, assertEquals, assertThrows } from "./deps_dev.js";

import { HyperErr } from "./lib/utils.js";

const { test } = Deno;

test("HyperErr - should accept nil, string, or object, and throw otherwise", () => {
  assert(HyperErr());
  assert(HyperErr({}));
  assert(HyperErr("foo"));
  assert(HyperErr({ msg: "foo" }));

  assertThrows(() => HyperErr({ foo: "bar" }));
  assertThrows(() => HyperErr([]));
  assertThrows(() => HyperErr(function () {}));
});

test("HyperErr - should set fields", () => {
  const base = HyperErr();
  const withStatus = HyperErr({ status: 404 });
  const fromStr = HyperErr("foo");
  const fromObj = HyperErr({ msg: "foo" });
  const strip = HyperErr({ msg: "foo", omit: "me" });

  assertEquals(base.ok, false);

  assertEquals(withStatus.status, 404);
  assert(!Object.keys(fromStr).includes("status"));

  assertEquals(fromStr.msg, "foo");
  assertEquals(fromObj.msg, "foo");
  assert(!strip.omit);
});
