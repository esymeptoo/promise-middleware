const DEFAULT_MIDDLEWARE = []

class PromiseMiddleware {
  constructor() {
    this.middlewares = []
    this.middlewareNames = {}
  }

  use(eventName, middleware, cover = false) {
    if (!this.middlewareNames[eventName]) {
      this.middlewareNames[eventName] = middleware
      this.middlewares.push(middleware)
    }
    if (cover) {
      this.middlewares.splice(this.middlewares.indexOf(this.middlewareNames[eventName]), 1, middleware)
      this.middlewareNames[eventName] = middleware
    }
  }

  remove(eventName) {
    if (!this.middlewareNames[eventName]) {
      return
    }
    this.middlewares.splice(this.middlewares.indexOf(this.middlewareNames[eventName]), 1)
  }

  update(...args) {
    this.use(...args, true)
  }

  // 执行中间件
  execute(options) {
    let promise = Promise.resolve(options)
    const middlewareChains = []
    this.middlewares.forEach((m = { fulfilled: res => res, rejected: res => res }) => {
      middlewareChains.push([m.fulfilled, m.rejected])
    })
    const chains = [...middlewareChains, ...DEFAULT_MIDDLEWARE]
    while (chains.length) {
      promise = promise.then(...chains.shift())
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
// promiseMiddleware.remove('add age')
promiseMiddleware.update('add age', {
  fulfilled: res => ({
    ...res,
    age: 13,
  }),
})
;(async () => {
  const response = await promiseMiddleware.execute({ name: '吴彦祖' })
  console.log(response)
})()
