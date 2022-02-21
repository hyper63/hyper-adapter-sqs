import { crocks, hmac, R } from "../deps.js";

const { Reader, Async } = crocks;
const {
  cond,
  ifElse,
  identity,
  T,
  complement,
  isNil,
  __,
  isEmpty,
  defaultTo,
  is,
  has,
  allPass,
  anyPass,
  filter,
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

const isEmptyObject = allPass([
  complement(is(Array)), // not an array
  is(Object),
  isEmpty,
]);
const rejectNil = filter(isDefined);

export const computeSignature = (secret, payload, time) => {
  const msg = `${time}.${JSON.stringify(payload, null, 0)}`;

  const signature = hmac("sha256", secret, msg, "utf8", "hex");
  return signature;
};

/**
 * Constructs a hyper-esque error
 *
 * @typedef {Object} HyperErrArgs
 * @property {string} msg
 * @property {string?} status
 *
 * @typedef {Object} NotOk
 * @property {false} ok
 *
 * @param {(HyperErrArgs | string)} argsOrMsg
 * @returns {NotOk & HyperErrArgs} - the hyper-esque error
 */
export const HyperErr = (argsOrMsg) =>
  compose(
    ({ ok, msg, status }) => rejectNil({ ok, msg, status }), // pick and filter nil
    assoc("ok", false),
    cond([
      [is(String), assoc("msg", __, {})],
      [
        anyPass([
          isEmptyObject,
          has("msg"),
          has("status"),
        ]),
        identity,
      ],
      [T, () => {
        throw new Error(
          "HyperErr args must be a string or an object with msg or status",
        );
      }],
    ]),
    defaultTo({}),
  )(argsOrMsg);

export const isHyperErr = allPass([
  has("ok"), // { ok }
  complement(prop("ok")), // { ok: false }
]);

export const handleHyperErr = ifElse(
  isHyperErr,
  Async.Resolved,
  Async.Rejected,
);
