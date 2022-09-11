const logger = require("../../../common/logs")
const validateServices = require("./validate")
const formatServices = require("./format")
const boServices = require("./bo.service")
const userServices = require("./user.service")

module.exports = servicesV1 = {
  ...validateServices,
  ...formatServices,
  logger,
  boServices,
  userServices,
}
