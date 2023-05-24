import { ask } from '../utils.js'

export default (bucket, name, doc) =>
  ask((s3) =>
    s3.putObject({
      Bucket: `hyper-queue-${bucket}`,
      Body: JSON.stringify(doc),
      Key: `${name}.json`,
    })
      .then((_) => ({ ok: true }))
  )
