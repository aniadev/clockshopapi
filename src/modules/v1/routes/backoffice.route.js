const express = require("express")
const router = express.Router()

const AdminRole = require("../middlewares/admin.middleware")
const BoController = require("../controllers/backoffice.controller")

// api.dev/bo/

router.post("/webhook", BoController.handleWebhook)

// api.dev/bo/statistic?type=[CLOCKTYPE | PROVIDER | MATERIAL]
router.get("/statistic", AdminRole, BoController.handleStatistic)

router.get("/revenue-stats", AdminRole, BoController.handleRevenueStats)
router.get("/order/all", AdminRole, BoController.getAllOrder)
router.post("/order/cod-approve", AdminRole, BoController.approveCodOrder)

module.exports = router
