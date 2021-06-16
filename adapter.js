const noop = () => null

export function adapter(env) {
  return Object.freeze({
    index: noop,
    create: noop,
    delete: noop,
    post: noop,
    get: noop,
    retry: noop,
    cancel: noop
  })
}