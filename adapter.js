import { crocks, R } from './deps.js'

const { Async } = crocks
const { pluck } = R

const noop = () => null

export function adapter(svcName, aws) {
  const getObject = Async.fromPromise(aws.getObject)
  const createBucket = Async.fromPromise(aws.createBucket)
  const createQueue = Async.fromPromise(aws.createQueue)
  const putObject = Async.fromPromise(aws.putObject)

  return Object.freeze({
    // list queues 
    index: getObject(svcName, 'queues').map(pluck('name')).toPromise(),
    // create queue
    create: ({ name, target, secret }) => {
      return createBucket(svcName)
        .chain(createQueue(svcName))
        .chain(getObject(svcName, 'queues'))
        .bichain(
          () => putObject(svcName, 'queues', {}).map(() => ({})),
          identity
        )
        .map(assoc(name, { target, secret }))
        .chain(queues => putObject(svcName, 'queues', queues))
        .toPromise()
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