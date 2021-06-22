import { ApiFactory, S3 } from "../../deps.js";

export default async function (bucket, folder) {
  const factory = new ApiFactory();
  const s3 = new S3(factory);
  const results = await s3.listObjects({
    Bucket: `hyper-queue-${bucket}`,
    Prefix: folder,
  });
  return results;
}
