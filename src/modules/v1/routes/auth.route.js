const express = require("express")
const router = express.Router()

const AuthController = require("../controllers/auth.controller")
const jwt = require("jsonwebtoken")

const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET
const Auth = require("../middlewares/auth.middleware")

// https://fakebook.com/v1/auth/
router.post("/", Auth, AuthController.auth)

// https://fakebook.com/v1/auth/login
router.post("/login", AuthController.login)

// https://fakebook.com/v1/auth/register
router.post("/register", AuthController.register)

module.exports = router
