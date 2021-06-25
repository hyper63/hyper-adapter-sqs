import { ApiFactory, R, S3 } from "../../deps.js";

const { compose, equals, map, pluck, prop, reject, replace } = R;

export default async function (bucket, folder) {
  const factory = new ApiFactory();
  const s3 = new S3(factory);
  const results = await s3.listObjects({
    Bucket: `hyper-queue-${bucket}`,
    Prefix: folder,
  }).then(compose(
    map(replace(".json", "")),
    reject(equals(`${folder}/`)),
    pluck("Key"),
    prop("Contents"),
  ));
  return results;
}
