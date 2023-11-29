export * as R from 'npm:ramda@0.28.0'
export { default as crocks } from 'npm:crocks@0.12.4'

export {
  ApiFactory,
  AwsEndpointResolver,
  DefaultCredentialsProvider,
} from 'https://deno.land/x/aws_api@v0.7.0/client/mod.ts'
export { S3 } from 'https://deno.land/x/aws_api@v0.7.0/services/s3/mod.ts'
export { SQS } from 'https://deno.land/x/aws_api@v0.7.0/services/sqs/mod.ts'
export { hmac } from 'https://deno.land/x/hmac@v2.0.1/mod.ts'

export {
  HyperErr,
  isHyperErr,
} from 'https://raw.githubusercontent.com/hyper63/hyper/hyper-utils%40v0.1.2/packages/utils/hyper-err.js'
