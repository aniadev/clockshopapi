const express = require("express")
const cors = require("cors")

const port = 8599
// import mysql
// const mysql = require("./configs/mysql.config");
// mysql.connect();
const mongodb = require("./common/configs/mongodb.config")

mongodb.connect()

// import Route
const Route = require("./routes")

const app = express()
// parse application/x-www-form-urlencoded
app.use(express.urlencoded({extended: false}))
// parse application/json
app.use(express.json())
app.use(cors())

Route(app)
const socketio = require("./modules/socketio/socketio.module")

// response handler
app.use((data, req, res, next) => {
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
})

socketio(app, mongodb)

app.listen(process.env.PORT || port, () =>
  console.log(`Example app listening on port ${process.env.PORT || port}!`)
)
