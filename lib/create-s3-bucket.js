import { ApiFactory, S3 } from '../deps.js'

export default function (name) {
  const factory = new ApiFactory()
  const s3 = new S3(factory)
  return s3.createBucket({
    Bucket: `hyper-queue-${name}`
  })

}