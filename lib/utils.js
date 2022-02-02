import { crocks, hmac, R } from "../deps.js";

const { Reader } = crocks;
const {
  always,
  cond,
  ifElse,
  is,
  identity,
  T,
  join,
  complement,
  isNil,
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

// always return a string
export const mapErr = cond([
  // string
  [is(String), identity],
  // { message } catches both Error, and Object with message prop
  [
    compose(
      isDefined,
      prop("message"),
    ),
    prop("message"),
  ],
  // { msg }
  [
    compose(
      isDefined,
      prop("msg"),
    ),
    prop("msg"),
  ],
  // []
  [
    is(Array),
    compose(
      join(", "),
      (errs) => errs.map(mapErr), // recurse
    ),
  ],
  // any non nil
  [isDefined, (val) => JSON.stringify(val)],
  // nil
  [T, () => "An error occurred"],
]);

// always return a number or undefined
export const mapStatus = cond([
  [is(Number), identity],
  [
    is(String),
    compose(
      ifElse(
        isNaN,
        always(undefined),
        identity,
      ),
      (status) => parseInt(status, 10),
    ),
  ],
  // anything else
  [T, always(undefined)],
]);

export const toHyperErr = (err) => ({
  ...err,
  status: mapStatus(err.status),
  msg: mapErr(err),
});
