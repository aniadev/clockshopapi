// response handler
module.exports = function (data, req, res, next) {
  let statusCode,
    status,
    message,
    resData = {}
  if (data.length == 3) {
    // [statusCode, message, data]
    statusCode = data[0] || 500
    status = statusCode === 500 ? "FAIL" : "SUCCESS"
    message = statusCode === 500 ? "EXTERNAL_SERVER_ERROR" : data[1]
    resData = data[2]
  } else if (data.length == 2) {
    //[statusCode, message]
    statusCode = data[0] || 500
    status = statusCode !== 200 ? "FAIL" : "SUCCESS"
    message = statusCode === 500 ? "EXTERNAL_SERVER_ERROR" : data[1]
  } else if (data.length == 1) {
    //[statusCode = 500]
    statusCode = 500
    status = "ERROR"
    message = "EXTERNAL_SERVER_ERROR"
  }
  res.status(statusCode).json({
    status,
    message,
    data: resData,
  })
  return
}
