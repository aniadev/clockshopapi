const logger = require("../../../common/logs")
const validateServices = require("./validate")
const formatServices = require("./format")
const boServices = require("./boServices")

module.exports = servicesV1 = {
  ...validateServices,
  ...formatServices,
  boServices,
  logger,
}
