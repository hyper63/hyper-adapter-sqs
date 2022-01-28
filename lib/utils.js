import { crocks, hmac, R } from "../deps.js";

const { Reader } = crocks;

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
