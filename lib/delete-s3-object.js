import { ApiFactory, S3 } from '../deps.js'

export default async function (bucket, name) {
  const factory = new ApiFactory()
  const s3 = new S3(factory)
  const doc = await s3.deleteObject({
    Bucket: `hyper-queue-${bucket}`,
    Key: `${name}.json`
  })
  return doc
}