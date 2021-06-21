import { ApiFactory, S3 } from '../../deps.js'

export default async function (bucket, name) {
  const factory = new ApiFactory()
  const s3 = new S3(factory)
  const result = await s3.deleteBucket({
    Bucket: `hyper-queue-${bucket}`
  })
  return result
}