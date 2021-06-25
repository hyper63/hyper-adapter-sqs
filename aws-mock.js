// deno-lint-ignore-file

let doc = {};

export function createQueue(name) {
  return Promise.resolve(
    `https://sqs.us-east-1.amazonaws.com/1234/hyper-queue-${name}`,
  );
}

export function createBucket(name) {
  return Promise.resolve(`/hyper-queue-${name}`);
}

export function putObject(svc, name, value) {
  doc = value;
  return Promise.resolve({ ok: true });
}

export function getObject(svc, name) {
  if (name === "test2/16613e7e-2331-4c7a-bf37-fe5861f2abe9") {
    return Promise.resolve({
      target: "https://jsonplaceholder.typicode.com/posts",
      queue: "test2",
      job: { hello: "world" },
      status: "ERROR",
    });
  }
  return Promise.resolve(doc);
}

export function getQueueUrl(svc) {
  return Promise.resolve(
    `https://sqs.us-east-1.amazonaws.com/1234/hyper-queue-${svc}`,
  );
}

export function deleteObject(svc, name) {
  return Promise.resolve({ ok: true });
}

export function deleteQueue(url) {
  return Promise.resolve({ ok: true });
}

export function deleteBucket(name) {
  return Promise.resolve({ ok: true });
}

export function sendMessage(url, msg) {
  return Promise.resolve({ ok: true });
}

export function receiveMessage(url, count) {
  return Promise.resolve([]);
}

export function deleteMessage(url, handle) {
  return Promise.resolve({ ok: true });
}

export function listObjects(bucket, folder) {
  return Promise.resolve(["test2/16613e7e-2331-4c7a-bf37-fe5861f2abe9"]);
}
