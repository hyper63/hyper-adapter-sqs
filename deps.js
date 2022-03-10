export * as R from "https://cdn.skypack.dev/ramda@0.28.0";
export { default as crocks } from "https://cdn.skypack.dev/crocks@0.12.4";

export {
  ApiFactory,
  AwsEndpointResolver,
} from "https://deno.land/x/aws_api@v0.6.0/client/mod.ts";
export { S3 } from "https://deno.land/x/aws_api@v0.6.0/services/s3/mod.ts";
export { SQS } from "https://deno.land/x/aws_api@v0.6.0/services/sqs/mod.ts";
export { hmac } from "https://deno.land/x/hmac@v2.0.1/mod.ts";

export {
  HyperErr,
  isHyperErr,
} from "https://x.nest.land/hyper-utils@0.1.0/hyper-err.js";
