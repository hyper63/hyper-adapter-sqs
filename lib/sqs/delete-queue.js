import { ask } from "../utils.js";

export default (QueueUrl) =>
  ask((sqs) =>
    sqs.deleteQueue({ QueueUrl })
      .then(() => ({ ok: true }))
  );
