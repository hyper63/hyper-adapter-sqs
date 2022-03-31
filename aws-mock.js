// deno-lint-ignore-file

let doc = {};

export default {
  s3: {
    checkBucket,
    createBucket,
    deleteBucket,
    getObject,
    putObject,
    deleteObject,
    listObjects,
  },
  sqs: {
    createQueue,
    deleteQueue,
    sendMessage,
    receiveMessage,
    deleteMessage,
    getQueueUrl,
  },
};

function createQueue(name) {
  return Promise.resolve(
    `https://sqs.us-east-1.amazonaws.com/1234/hyper-queue-${name}`,
  );
}

function createBucket(name) {
  return Promise.resolve(`/hyper-queue-${name}`);
}

function checkBucket() {
  const err = new Error("foo");
  err.code = "Http404"; // by default, do bucket does not exist

  return Promise.reject(err);
}

function putObject(svc, name, value) {
  doc = value;
  return Promise.resolve({ ok: true });
}

function getObject(svc, name) {
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

function getQueueUrl(svc) {
  return Promise.resolve(
    `https://sqs.us-east-1.amazonaws.com/1234/hyper-queue-${svc}`,
  );
}

function deleteObject(svc, name) {
  return Promise.resolve({ ok: true });
}

function deleteQueue(url) {
  return Promise.resolve({ ok: true });
}

function deleteBucket(name) {
  return Promise.resolve({ ok: true });
}

function sendMessage(url, msg) {
  return Promise.resolve({ ok: true });
}

function receiveMessage(url, count) {
  return Promise.resolve([]);
}

function deleteMessage(url, handle) {
  return Promise.resolve({ ok: true });
}

function listObjects(bucket, folder) {
  return Promise.resolve(["test2/16613e7e-2331-4c7a-bf37-fe5861f2abe9"]);
}
