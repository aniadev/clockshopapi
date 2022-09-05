const logger = require("../../../common/logs")
const validateServices = require("./validate")
const formatServices = require("./format")

module.exports = servicesV1 = {
  ...validateServices,
  ...formatServices,
  logger,
}
