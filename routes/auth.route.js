const express = require("express")

const router = express.Router()
const jwt = require("jsonwebtoken")

const mysql = require("../config/mysql")

const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET
const Auth = require("../middlewares/auth.middleware")

// https://fakebook.com:8080/auth/
router.post("/", Auth, async (req, res) => {
  try {
    const [type, accessToken] = [...req.headers.authorization.split(" ")]
    let jwt_decoded = jwt.verify(accessToken, SECRET_KEY)
    // console.log(jwt_decoded);
    const queryFields = "user_id, username, name, email, avatar, blue_tick"
    await mysql.db.query(
      `SELECT ${queryFields} FROM users WHERE username = '${jwt_decoded.username}'`,
      function (error, result, fields) {
        if (error || !result[0]) {
          res.json({
            success: false,
            status: 401,
            method: "POST",
            message: "invalid token",
          })
          return false
        }
        const userData = {
          userId: result[0].user_id,
          username: result[0].username,
          name: result[0].name,
          avatar: result[0].avatar,
          email: result[0].email,
          blueTick: result[0].blue_tick,
        }
        let accessToken = jwt.sign(userData, SECRET_KEY)
        res.json({
          success: true,
          method: "POST",
          message: "authenticated",
          userData,
          accessToken,
        })
      }
    )
  } catch (error) {
    console.log("Parse error: " + error)
    res.json({
      success: false,
      status: 401,
      method: "POST",
      message: "invalid token",
    })
  }
})

// https://fakebook.com:8080/auth/login
router.post("/login", async (req, res) => {
  const {username, password} = req.body
  // console.log({ username, password });
  const queryFields =
    "user_id, username, name, avatar, email, blue_tick AS blueTick"
  try {
    mysql.db.query(
      `SELECT ${queryFields} FROM users WHERE username = ${mysql.db.escape(
        username
      )} AND password = ${mysql.db.escape(password)}`,
      function (err, result) {
        if (err) {
          console.log(err.message)
          res.json({
            success: false,
            message: err.message,
          })
        }
        if (result[0]) {
          const userData = {
            userId: result[0].user_id,
            username: result[0].username,
            name: result[0].name,
            avatar: result[0].avatar,
            email: result[0].email,
            blueTick: result[0].blueTick,
          }
          let accessToken = jwt.sign(userData, SECRET_KEY)
          res.json({
            success: true,
            message: "login successful",
            accessToken,
            type: "Bearer",
            userData,
          })
        } else {
          res.json({
            success: false,
            message: "wrong username or password",
          })
        }
      }
    )
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    })
  }
})

// https://fakebook.com:8080/auth/register
router.post("/register", async (req, res) => {
  const regData = req.body
  let {username, password, name} = regData

  if (!username || !password || !name) {
    res.json({
      success: false,
      message: "invalid fields",
    })
  } else {
    try {
      let username = mysql.db.escape(regData.username) // SQL INJECTION
      let password = mysql.db.escape(regData.password)
      let name = mysql.db.escape(regData.name)
      let email = mysql.db.escape(regData.email)
      console.log(username)
      mysql.db.query(
        `SELECT username FROM users WHERE username = ${username}`,
        function (err, userData) {
          if (err) throw err
          // console.log();
          if (!userData[0]) {
            var sql = `INSERT INTO users (name, username, email, password) VALUES (${name}, ${username},${email},${password})`
            mysql.db.query(sql, function (err, result) {
              if (err) throw err
              console.log(result)
              res.json({
                success: true,
                message: "register successful",
              })
            })
          } else {
            res.json({
              success: false,
              message: "invalid username",
            })
          }
        }
      )
    } catch (error) {
      // console.log(error);
      res.json({
        success: false,
        message: error.message,
      })
    }
  }
})

module.exports = router
