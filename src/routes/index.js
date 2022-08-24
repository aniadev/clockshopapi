const routerV1 = require("../modules/v1")

route = (app) => {
  app.use("/api/v1", routerV1)
  app.use("/", routerV1)
}

module.exports = route
