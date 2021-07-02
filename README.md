<h1 align="center">
hyper-adapter-sqs
</h1>
<p align="center">A Queue port adapter for AWS SQS in the <a href="https://hyper.io/">hyper</a>  service framework</p>

<p align="center">
  <a href="https://nest.land/package/hyper-adapter-sqs"><img src="https://nest.land/badge.svg" alt="Nest Badge" /></a>
  <a href="https://github.com/hyper63/hyper-adapter-sqs/actions/workflows/test.yml"><img src="https://github.com/hyper63/hyper-adapter-sqs/actions/workflows/test.yml/badge.svg" alt="Test" /></a>
  <a href="https://github.com/hyper63/hyper-adapter-sqs/tags/"><img src="https://img.shields.io/github/tag/hyper63/hyper-adapter-sqs" alt="Current Version" /></a>
</p>

## Table of Contents

- [Getting Started](#getting-started)
- [Example](#example)
- [Installation](#installation)
- [Contributing](#contributing)
- [License](#license)

## Getting Started

`hyper.config.js`

```js
import { default as sqs } from "https://x.nest.land/hyper-adapter-sqs@0.1.4/mod.js";

export default {
  app: opine,
  adapter: [
    { port: "queue", plugins: [sqs("UNIQUE_NAME")] },
  ],
};
```

In order to use this adapter you will need to have an AWS Account and will need
the following information:

- IAM User with access to SQS (AWS_ACCESS_KEY_ID, AWS_ACCESS_SECRET_KEY)
- AWS Region (default: us-east-1)

> The AWS User will need the ability to manage s3 and SQS resources

### ENV VARS

You may set envrionment variables like so, and the adapter will use them:

```txt
AWS_ACCESS_KEY_ID=XXXXX
AWS_SECRET_ACCESS_KEY=XXXX
AWS_REGION=XXXXX
```

Then when you configure the hyper service, you can setup the sqs adapter like:

> The unique name is an alphanumeric string that contains identifing
> information, this will enable you to identify the bucket and queue which will
> be prefixed by 'hyper-queue-' and whatever name you provide.

`hyper.config.js`

```js
import { default as sqs } from "https://x.nest.land/hyper-adapter-sqs@0.1.4/mod.js";

export default {
  app: opine,
  adapter: [
    { port: "queue", plugins: [sqs("UNIQUE_NAME")] },
  ],
};
```

> NOTE: You can explictly pass in AwsAccessKeyId, AwsSecretKey, region as
> options in the adapter method.
> `sqs(UNIQUE_NAME, { awsAccessKeyId, awsSecretKey, region: 'us-east-1'})`

## Example

create queue

```sh
curl -X PUT -H 'Content-Type: application/json' -d '{"target": "url"}' cloud.hyper.io/queue/hooks
```

post queue

```sh
curl -X POST -H 'Content-Type: application/json' -d '{...}' cloud.hyper.io/queue/hooks
```

## Installation

This is a Deno module available to import from
[nest.land](https://nest.land/package/hyper-adapter-sqs)

deps.js

```js
export { default as sqs } from "https://x.nest.land/hyper-adapter-sqs@0.1.4/mod.js";
```

## Contributing

Contributions are welcome! See the hyper
[contribution guide](https://docs.hyper.io/contributing-to-hyper)

## Testing

```
./scripts/test.sh
```

To lint, check formatting, and run unit tests

## License

Apache License 2.0 SEE [LICENSE](LICENSE)
