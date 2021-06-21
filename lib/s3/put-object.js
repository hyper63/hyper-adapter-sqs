import { ApiFactory, S3 } from '../../deps.js'

export default function (bucket, name, doc) {
  const factory = new ApiFactory()
  const s3 = new S3(factory)
  return s3.putObject({
    Bucket: `hyper-queue-${bucket}`,
    Body: JSON.stringify(doc),
    Key: `${name}.json`
  })

}