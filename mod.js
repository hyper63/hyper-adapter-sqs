import { ApiFactory, crocks, R } from "./deps.js";

import { adapter } from "./adapter.js";
import aws from "./aws.js";

const ID = "sqs";
const { Either } = crocks;
const { Left, Right } = Either;
const { __, assoc, identity, isNil, lensProp, over } = R;

export const PORT = "queue"

/**
 * @param {string} svcName - name of queue service
 * @param {object} [options] - optional set of config options for adapter
 */
export default function sqsAdapter(svcName, options = {}) {
  const setName = assoc("name", __, {});
  const createFactory = over(
    lensProp("factory"),
    () => (options.awsAccessKeyId && options.awsSecretKey && options.region)
      ? new ApiFactory({ credentials: options })
      : new ApiFactory(),
  );
  const loadAws = (env) =>
    over(lensProp("aws"), () => aws.runWith(env.factory), env);

  return Object.freeze({
    id: ID,
    port: PORT,
    load: () =>
      //notIsNull(svcName)
      Right(svcName)
        .map(setName)
        .map(createFactory)
        .map(loadAws)
        .map((tap) => (console.log('data', tap), tap)) // print out current state
        .either(
          (e) => (console.log("ERROR: In Load Method", e.message), e),
          identity,
        )
    ,
    link: (env) => () => adapter(env), // env: {name, aws: {s3, sqs}, factory}
  });
}

function notIsNull(s) {
  isNil(s) ? Left({ message: "SQS Service Name: can not be null!" }) : Right(s);
}
