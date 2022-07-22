// const auth = require("./auth.route");
const siteRoute = require("./site.route");

route = (app) => {
  //use routes
  //   app.use("/auth", auth);
  app.use("/", siteRoute);
};

module.exports = route;
