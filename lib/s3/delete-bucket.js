import { ask, assoc } from "../utils.js";

export default (bucket) =>
  ask((s3) =>
    s3.deleteBucket(
      assoc("Bucket", `hyper-queue-${bucket}`, {}),
    )
  );
