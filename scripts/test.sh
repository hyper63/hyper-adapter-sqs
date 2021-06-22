#!/usr/bin/env bash

deno fmt --check
deno test -A adapter_test.js