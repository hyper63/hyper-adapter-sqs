import { ask } from "../utils.js";

export default (bucket, name) =>
  ask((s3) =>
    s3.getObject({
      Bucket: `hyper-queue-${bucket}`,
      Key: `${name}.json`,
    })
      .then((r) => JSON.parse(new TextDecoder().decode(r.Body)))
  );
