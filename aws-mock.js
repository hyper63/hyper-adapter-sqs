let doc = {}

export function createQueue(name) {
  return Promise.resolve(`https://sqs.us-east-1.amazonaws.com/1234/hyper-queue-${name}`)
}

export function createBucket(name) {
  return Promise.resolve(`/hyper-queue-${name}`)
}

export function putObject(svc, name, value) {
  doc = value
  return Promise.resolve({ ok: true })
}

export function getObject(svc, name) {
  return Promise.resolve(doc)
}

export function getQueueUrl(svc) {
  return Promise.resolve(`https://sqs.us-east-1.amazonaws.com/1234/hyper-queue-${svc}`)
}

export function deleteObject(svc, name) {
  return Promise.resolve({ ok: true })
}

export function deleteQueue(url) {

  return Promise.resolve({ ok: true })
}

export function deleteBucket(name) {
  return Promise.resolve({ ok: true })
}