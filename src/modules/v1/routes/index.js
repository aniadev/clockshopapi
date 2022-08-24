class Routers {
  constructor() {
    this.express = require("express")
    this.router = this.express.Router()
    this.allRouters = new Map()
  }
  map(routerPath, routerPathDir) {
    this.allRouters.set(routerPath, require(routerPathDir))

    this.allRouters.forEach((childRoute, routerPath) => {
      this.router.use(routerPath, childRoute)
    })
  }
}

v1Router = new Routers()

// Map routes to child routes
v1Router.map("/auth", "./auth.route")
v1Router.map("/", "./site.route")

module.exports = v1Router.router
