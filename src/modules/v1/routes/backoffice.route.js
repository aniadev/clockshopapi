const express = require("express")
const router = express.Router()

const AdminRole = require("../middlewares/admin.middleware")
const BoController = require("../controllers/backoffice.controller")

// api.dev/bo/

router.post("/webhook", BoController.handleWebhook)

// stats:
router.get("/statistic", BoController.handleStatistic)

module.exports = router
