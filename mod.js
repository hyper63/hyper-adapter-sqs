import {
  ApiFactory,
  AwsEndpointResolver,
  crocks,
  DefaultCredentialsProvider,
  R,
} from "./deps.js";

import { adapter } from "./adapter.js";
import aws from "./aws.js";

const ID = "sqs";
const { Either } = crocks;
const { Left, Right, of } = Either;
const {
  __,
  assoc,
  reject,
  identity,
  isNil,
  lensProp,
  mergeRight,
  over,
  defaultTo,
} = R;

export const PORT = "queue";

/**
 * @typedef {Object} SqsAdapterOptions
 * @property {number} [sleep] - the number of milliseconds to wait
 * to receive more jobs, if no jobs were recevied on the previous
 * process task
 * @property {string} [awsAccessKeyId] - the AWS Access Key ID to use. Defaults to Environment AWS_ACCESS_KEY_ID
 * @property {string} [awsSecretKey] - the AWS Secret Key to use. Defaults to Environment AWS_SECRET_ACCESS_KEY
 * @property {string} [sessionToken] - the AWS Session Token to use. Defaults to Environment AWS_SESSION_TOKEN
 * @property {string} [region] - the AWS Region to use. Defaults to Environment AWS_REGION
 *
 * @param {string} svcName - name of queue service
 * @param {SqsAdapterOptions} [options] - optional set of config options for adapter
 */
export default function sqsAdapter(svcName, options = {}) {
  const setNameOn = (obj) => assoc("name", __, obj);
  // sleep, aws credentials
  const setOptions = (env) =>
    mergeRight(
      env,
      reject(isNil, options),
    );

  const setSleep = (env) =>
    mergeRight(
      { sleep: 10000 },
      env,
    );

  const setConcurrency = (env) =>
    mergeRight(
      { concurrency: 20 },
      env,
    );

  const setAwsRegion = (env) =>
    mergeRight(
      { region: "us-east-1" },
      env,
    );
  const createFactory = (env) =>
    over(
      lensProp("factory"),
      () =>
        /**
         * Disable using Dualstack endpoints, so this adapter will use VPC Gateway endpoint when used within a VPC
         * - For lib api, see https://github.com/cloudydeno/deno-aws_api/blob/3afef9fe3aaef842fd3a19245593494c3705a1dd/lib/client/endpoints.ts#L19
         * - For Dualstack description https://docs.aws.amazon.com/AmazonS3/latest/userguide/dual-stack-endpoints.html#dual-stack-endpoints-description
         */
        new ApiFactory({
          credentialProvider:
            (env.awsAccessKeyId && env.awsSecretKey && env.region)
              ? { getCredentials: () => Promise.resolve(env) }
              : {
                ...DefaultCredentialsProvider,
                getCredentials: () =>
                  DefaultCredentialsProvider.getCredentials()
                    .then(setAwsRegion),
              },
          endpointResolver: new AwsEndpointResolver({ useDualstack: false }),
        }),
      env,
    );
  const loadAws = (env) =>
    over(lensProp("aws"), () => aws.runWith(env.factory), env);

  return Object.freeze({
    id: ID,
    port: PORT,
    load: (prevLoad) =>
      of(prevLoad)
        .map(defaultTo({}))
        .chain((env) =>
          notIsNull(svcName)
            .map(setNameOn(env))
        )
        .map(setOptions)
        .map(setSleep)
        .map(setConcurrency)
        .map(setAwsRegion)
        .map(createFactory)
        .map(loadAws)
        .map((
          tap,
        ) => (console.log(
          "data",
          redact(["awsAccessKeyId", "awsSecretKey"], { ...tap }),
        ),
          tap)
        ) // print out current state
        .either(
          (e) => (console.log("ERROR: In Load Method", e.message), e),
          identity,
        ),
    link: (env) => () => adapter(env), // env: {name, aws: {s3, sqs}, factory}
  });
}

function notIsNull(s) {
  return isNil(s)
    ? Left({ message: "SQS Service Name: can not be null!" })
    : Right(s);
}

function redact(keys, obj) {
  keys.forEach(
    (key) => {
      obj[key] = "****";
    },
  );

  return obj;
}
