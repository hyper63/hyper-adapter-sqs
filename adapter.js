import { crocks, R } from './deps.js'

const { Async } = crocks
const { all, assoc, dissoc, equals, identity, keys, pluck } = R

const noop = () => null

export function adapter(svcName, aws) {
  const createBucket = Async.fromPromise(aws.createBucket)
  const createQueue = Async.fromPromise(aws.createQueue)
  const getObject = Async.fromPromise(aws.getObject)
  const putObject = R.curry(function (a, b, c) {
    return Async.fromPromise(aws.putObject)(a, b, c)
  })
  const getQueueUrl = Async.fromPromise(aws.getQueueUrl)
  const deleteQueue = Async.fromPromise(aws.deleteQueue)
  const deleteBucket = Async.fromPromise(aws.deleteBucket)
  const deleteObject = Async.fromPromise(aws.deleteObject)
  /*
  const putObject = Async.fromPromise(aws.putObject)
  
  */
  return Object.freeze({
    // list queues 
    //index: getObject(svcName, 'queues').map(pluck('name')).toPromise(),
    // create queue
    create: ({ name, target, secret }) => {
      return Async.of(svcName)
        .chain(svcName => Async.all([
          createBucket(svcName),
          createQueue(svcName)
        ]))
        .chain(() => getObject(svcName, 'queues'))
        .bichain(
          (err) => err.message.includes('NoSuchKey')
            ? putObject(svcName, 'queues', {}).map(() => ({}))
            : Async.Rejected(err),
          Async.Resolved
        )
        .map(assoc(name, { target, secret }))
        .chain(putObject(svcName, 'queues'))
        .toPromise()
    },
    // delete queue
    delete: name => getObject(svcName, 'queues')
      .map(dissoc(name))
      .chain(queues =>
        // remove parent queue and bucket if no more queues defined
        keys(queues).length === 0
          ? deleteObject(svcName, 'queues')
            .chain(() => Async.all([
              getQueueUrl(svcName).chain(deleteQueue),
              deleteBucket(svcName)
            ]))
            .map(results =>
              ({ ok: all(equals(true), pluck('ok', results)) })
            )
          : putObject(svcName, 'queues', queues)
      )
      .toPromise()
    ,
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