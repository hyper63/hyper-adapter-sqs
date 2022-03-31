import { ask, assoc } from "../utils.js";

export default (name) =>
  ask((s3) =>
    s3.headBucket(
      assoc("Bucket", `hyper-queue-${name}`, {}),
    )
  );
