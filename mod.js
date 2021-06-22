import { adapter } from "./adapter.js";
import * as aws from "./aws.js";

/**
 * @param {string} svcName - name of queue service
 */
export default function sqsAdapter(svcName) {
  return Object.freeze({
    id: "sqs",
    port: "queue",
    load: () => svcName,
    link: (env) => () => adapter(env, aws),
  });
}
