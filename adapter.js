const noop = () => null

// connectString = aws://key:secret@region/account
// new Url(connectString)

export function adapter({
  prefix,
  AWS_ACCOUNT,
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  SQSQueue
}) {

  return Object.freeze({
    // list queues
    index: noop,
    // create queue
    create: noop,
    // delete queue
    delete: noop,
    // post job
    post: noop,
    // get jobs
    get: noop,
    // retry job
    retry: noop,
    // cancel job
    cancel: noop
  })
}