
import { adapter } from './adapter.js'
import { SQSQueue } from './deps.js'

export default function sqsAdapter(config) {
  return Object.freeze({
    id: 'sqs',
    port: 'queue',
    load: () => config,
    link: env => () => adapter(env)
  })
}