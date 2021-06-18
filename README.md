# README

AWS SQS Adapter for hyper Queue port

In order to use this adapter you will need to have an AWS Account and will need the 
following information:

* AWS Account Number
* IAM User with access to SQS (AWS_ACCESS_KEY_ID, AWS_ACCESS_SECRET_KEY)
* AWS Region (default: us-east-1)

To make it easier to share config information, we create a url that can contain
all the above information in a single environment variable.

`SQS=aws://AWS_ACCESS_KEY_ID:AWS_ACCESS_SECRET_KEY@AWS_REGION/AWS_ACCOUNT`

Then when you configure the hyper service, you can setup the sqs adapter like:

hyper.config.js

``` js
import {default as sqs} from 'https://deno.land/x/hyper-sqs-adapter@1.0.0/mod.js'

const SQS_CONFIG_URL = Deno.env.get('SQS')

export default {
  app: opine,
  adapter: [
    { port: 'queue', plugins: [sqs(SQS_CONFIG_URL)]}
  ]
}
```

## Example

TODO

## Testing

```
./scripts/test.sh
```


