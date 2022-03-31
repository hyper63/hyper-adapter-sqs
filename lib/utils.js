import { crocks, hmac, HyperErr, isHyperErr, R } from "../deps.js";

const { Reader, Async } = crocks;
const {
  ifElse,
  complement,
  isNil,
  allPass,
  has,
  __,
  find,
  includes,
  propSatisfies,
} = R;

export const isDefined = complement(isNil);
export const ask = Reader.ask;
export const assoc = R.assoc;
export const prop = R.prop;
export const compose = R.compose;
export const equals = R.equals;
export const map = R.map;
export const pluck = R.pluck;
export const reject = R.reject;
export const replace = R.replace;

export const computeSignature = (secret, payload, time) => {
  const msg = `${time}.${JSON.stringify(payload, null, 0)}`;

  const signature = hmac("sha256", secret, msg, "utf8", "hex");
  return signature;
};

export const tokenErrs = [
  "InvalidAccessKeyId",
  "InvalidToken",
  "ExpiredToken",
  "SignatureDoesNotMatch",
];

export const isAwsTokenErr = allPass([
  has("message"),
  propSatisfies(
    (s) => find(includes(__, s), tokenErrs),
    "message",
  ),
]);

export const handleHyperErr = ifElse(
  isHyperErr,
  Async.Resolved,
  Async.Rejected,
);

export const asyncifyMapTokenErrs = (fn) =>
  Async.fromPromise(
    (...args) =>
      Promise.resolve(fn(...args))
        .catch((err) => {
          // Map token errs to a HyperErr
          // TODO: emit 'unhealthy' when event listener api is finalized
          if (isAwsTokenErr(err)) {
            throw HyperErr({ status: 500, msg: "AWS credentials are invalid" });
          }
          throw err;
        }),
  );
