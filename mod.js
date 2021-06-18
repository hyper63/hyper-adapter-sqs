
import { adapter } from './adapter.js'
import { SQSQueue } from './deps.js'

/**
 * @param {string} config - url string aws://key:secret@region/account
 */
export default function sqsAdapter(config) {
  return Object.freeze({
    id: 'sqs',
    port: 'queue',
    load: () => config,
    link: env => () => adapter(env, SQSQueue)
  })
}