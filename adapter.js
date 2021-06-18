const noop = () => null

// connectString = aws://key:secret@region/account
// new Url(connectString)

export function adapter(configUrl, SQSQueue) {
  const config = new URL(configUrl)
  const AWS_ACCESS_KEY_ID = config.username
  const AWS_ACCESS_SECRET_KEY = config.password
  const AWS_REGION = config.host
  const AWS_ACCOUNT = config.pathname

  const qUrl = name => `https://sqs.${AWS_REGION}.amazonaws.com${AWS_ACCOUNT}/${name}`
  let queues = {}

  function createQueue(name, target, secret) {
    if (queues[name]) {
      return queues[name]
    } else {
      const queue = new SQSQueue({
        queueURL: qUrl(name),
        accessKeyID: AWS_ACCESS_KEY_ID,
        secretKey: AWS_SECRET_ACCESS_KEY,
        region: AWS_REGION,
      });
      // TODO: need to store queue info in a 
      // s3 bucket hyper-sqs-${name}?
      queues[name] = ({ queue, target, secret })
      return queue
    }
  }

  return Object.freeze({
    // list queues
    index: noop,
    // create queue
    create: ({ name, target, secret }) => {
      createQueue(name, target, secret)
      return Promise.resolve({ ok: true })
    },
    // delete queue
    delete: noop,
    // post job
    post: ({}),
    // get jobs
    get: noop,
    // retry job
    retry: noop,
    // cancel job
    cancel: noop
  })
}