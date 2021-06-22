import { ApiFactory, S3, R } from '../../deps.js'

const { prop } = R

export default function (name) {
  const factory = new ApiFactory()
  const s3 = new S3(factory)
  return s3.createBucket({
    Bucket: `hyper-queue-${name}`
  }).then(prop('Location'))

}