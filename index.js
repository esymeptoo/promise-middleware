const DEFAULT_MIDDLEWARE = []

class PromiseMiddleware {
  constructor() {
    this.middlewares = []
    this.middlewareNames = {}
  }

  use(eventName, middleware) {
    if (!this.middlewareNames[eventName]) {
      this.middlewareNames[eventName] = middleware
      this.middlewares.push(middleware)
    }
  }

  remove(eventName) {
    if (!this.middlewareNames[eventName]) {
      return
    }
    this.middlewares.splice(this.middlewares.indexOf(this.middlewareNames[eventName]), 1)
  }

  // 执行中间件
  executeMiddleware(options) {
    let promise = Promise.resolve(options)
    const middlewareChains = []
    this.middlewares.forEach((m = { fulfilled: res => res, rejected: res => res }) => {
      middlewareChains.push(m.fulfilled, m.rejected)
    })
    const chains = [...middlewareChains, ...DEFAULT_MIDDLEWARE]
    while (chains.length) {
      promise = promise.then(chains.shift(), chains.shift())
    }
    return promise
  }
}

const promiseMiddleware = new PromiseMiddleware()
promiseMiddleware.use('add age', {
  fulfilled: res => ({
    ...res,
    age: 12,
  }),
})
promiseMiddleware.use('change-name', {
  fulfilled: async (res) => await new Promise(resolve => setTimeout(() => resolve({ ...res, name: '金城武' }), 2000)),
})
promiseMiddleware.remove('add age')
;(async () => {
  const response = await promiseMiddleware.executeMiddleware({ name: '吴彦祖' })
  console.log(response)
})()
