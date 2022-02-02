#!/usr/bin/env bash

deno lint
deno fmt --check
DENO_ENV=test deno test --unstable -A adapter_test.js process-tasks_test.js mod.test.js utils.test.js
