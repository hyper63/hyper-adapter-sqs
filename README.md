<h1 align="center">
hyper-adapter-sqs
</h1>
<p align="center">

[![nest badge](https://nest.land/badge.svg)](https://nest.land/package/hyper-adapter-sqs)
[![current version](https://img.shields.io/github/tag/hyper63/hyper-adapter-sqs)](https://github.com/hyper63/hyper-adapter-sqs/tags/)
[![Test](https://github.com/hyper63/hyper-adapter-sqs/actions/workflows/test.yml/badge.svg)](https://github.com/hyper63/hyper-adapter-sqs/actions/workflows/test.yml)

</p>

AWS SQS Adapter for hyper Queue port

In order to use this adapter you will need to have an AWS Account and will need
the following information:

- IAM User with access to SQS (AWS_ACCESS_KEY_ID, AWS_ACCESS_SECRET_KEY)
- AWS Region (default: us-east-1)

> The AWS User will need the ability to manage s3 and SQS resources

## ENV VARS

``` txt
AWS_ACCESS_KEY_ID=XXXXX
AWS_SECRET_ACCESS_KEY=XXXX
AWS_REGION=XXXXX
```

Then when you configure the hyper service, you can setup the sqs adapter like:

> The unique name is an alphanumeric string that contains identifing information, this will enable you
> to identify the bucket and queue which will be prefixed by 'hyper-queue-' and whatever name you provide.

hyper.config.js

```js
import { default as sqs } from "https://deno.land/x/hyper-sqs-adapter@1.0.0/mod.js";

export default {
  app: opine,
  adapter: [
    { port: "queue", plugins: [sqs('UNIQUE_NAME')] },
  ],
};
```

## Example

TODO

## Testing

```
./scripts/test.sh
```
