import { assertEquals } from "./deps_dev.js";

import { mapErr, mapStatus, toHyperErr } from "./lib/utils.js";

const { test } = Deno;

test("mapErr - should return the string", () => {
  const res = mapErr("foobar");

  assertEquals(res, "foobar");
});

test("mapErr - should return the error message", () => {
  const res = mapErr(new Error("foobar"));

  assertEquals(res, "foobar");
});

test("mapErr - should return the object message", () => {
  const res = mapErr({ message: "foobar" });

  assertEquals(res, "foobar");
});

test("mapErr - should return the stringified thing", () => {
  const res = mapErr({ foo: "bar" });

  assertEquals(res, JSON.stringify({ foo: "bar" }));
});

test("mapErr - should return generic message", () => {
  const res = mapErr(undefined);

  assertEquals(res, "An error occurred");
});

test("mapStatus - should parse status", () => {
  assertEquals(mapStatus("200"), 200);
});

test("mapStatus - should not set status", () => {
  assertEquals(mapStatus("foo"), undefined);
  assertEquals(mapStatus(undefined), undefined);
  assertEquals(mapStatus({}), undefined);
});

test("toHyperErr - should return a hyper error shape", () => {
  const err = toHyperErr({ message: "foo", status: 200, extra: "field" });

  assertEquals(err.ok, false);
  assertEquals(err.msg, "foo");
  assertEquals(err.status, 200);
  assertEquals(err.extra, "field");
});
