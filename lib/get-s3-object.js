import { ApiFactory, S3 } from '../deps.js'

export default async function (bucket, name) {
  const factory = new ApiFactory()
  const s3 = new S3(factory)
  const doc = await s3.getObject({
    Bucket: `hyper-queue-${bucket}`,
    Key: `${name}.json`
  })
  return JSON.parse(new TextDecoder().decode(doc.Body))
}