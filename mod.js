import { ApiFactory, crocks, R } from "./deps.js";

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
 * @param {string} svcName - name of queue service
 * @param {object} [options] - optional set of config options for adapter
 */
export default function sqsAdapter(svcName, options = {}) {
  const setNameOn = (obj) => assoc("name", __, obj);
  const setAwsCreds = (env) =>
    mergeRight(
      env,
      reject(isNil, options),
    );
  const setAwsRegion = (env) =>
    mergeRight(
      { region: "us-east-1" },
      env,
    );
  const createFactory = (env) =>
    over(
      lensProp("factory"),
      () => {
        return (env.awsAccessKeyId && env.awsSecretKey)
          ? new ApiFactory({ credentials: env })
          : new ApiFactory();
      },
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
        .map(setAwsCreds)
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
