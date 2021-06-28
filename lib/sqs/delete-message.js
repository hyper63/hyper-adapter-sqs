import { ask } from "../utils.js";

export default (url, handle) =>
  ask((sqs) =>
    sqs.deleteMessage({
      QueueUrl: url,
      ReceiptHandle: handle,
    }).then(() => ({ ok: true }))
  );
