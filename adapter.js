import { crocks, R } from './deps.js'

const { Async } = crocks
const { assoc, identity, pluck } = R

const noop = () => null

export function adapter(svcName, aws) {
  const getObject = Async.fromPromise(aws.getObject)
  const createBucket = Async.fromPromise(aws.createBucket)
  const createQueue = Async.fromPromise(aws.createQueue)
  const putObject = Async.fromPromise(aws.putObject)
  const deleteQueue = Async.fromPromise(aws.deleteQueue)
  const deleteBucket = Async.fromPromise(aws.deleteBucket)
  const deleteObject = Async.fromPromise(aws.deleteObject)

  return Object.freeze({
    // list queues 
    index: getObject(svcName, 'queues').map(pluck('name')).toPromise(),
    // create queue
    create: ({ name, target, secret }) => {
      return Async.of(svcName)
        .chain(svcName => Async.all([
          createBucket(svcName),
          createQueue(svcName)
        ]))
        .chain(() => getObject(svcName, 'queues'))
        .bichain(
          () => putObject(svcName, 'queues', {}).map(() => ({})),
          Async.Resolved
        )
        .map(assoc(name, { target, secret }))
        .chain(queues => putObject(svcName, 'queues', queues))
        .toPromise()
    },
    // delete queue
    delete: name => getObject(svcName, 'queues')
      .map(dissoc(name))
      .chain(queues =>
        keys(queues).length === 0
          ? deleteObject(svcName, 'queues').chain(() => Async.all([
            deleteQueue(svcName),
            deleteBucket(svcName)
          ]))
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