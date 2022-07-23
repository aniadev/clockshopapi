class SiteController {
  // [GET] /
  index(req, res, next) {
    res.json({
      statusCode: 200,
      status: "success",
      message: "Welcome to API",
    })
  }
  // [GET] /test
  test(req, res, next) {
    res.json({
      statusCode: 200,
      status: "success",
      message: "test",
    })
  }
}

module.exports = new SiteController() // export class
