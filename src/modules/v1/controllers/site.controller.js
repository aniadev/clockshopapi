const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET
const Auth = require("../middlewares/auth.middleware")
const {
  User,
  Cart,
  Clock,
  ClockType,
  Order,
  OrderDetail,
  Payment,
  Material,
  Provider,
} = require("../../../common/models")

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
  async test(req, res, next) {
    res.json({
      statusCode: 200,
      status: "success",
      message: "test",
    })
  }

  // [GET] /generate
  async generate(req, res, next) {
    try {
      const newUser = new User({
        fullName: "John Cena",
        phoneNumber: "123456",
        username: "johncena",
        email: "johncena@gmail.com",
        password: "johncena",
        address: "Thai Binh",
      })
      const newUserData = await newUser.save()

      const newProvider = new Provider({
        name: "INTEL",
      })
      const newProviderData = await newProvider.save()

      const newMaterial = new Material({
        name: "Gỗ thông",
        info: "Gỗ thông",
      })
      const newMaterialData = await newMaterial.save()

      const newClockType = new ClockType({
        name: "Đặt sàn",
        description: "1000mm x 540mm x 320mm",
      })
      const newClockTypeData = await newClockType.save()

      const newClock = new Clock({
        model: "C-02",
        description: "C-02",
        images: [
          "https://i.ibb.co/L0SZNSD/anifastbook-IMAGE-Sat-Aug272022-101132.jpg",
        ],
        numOfRemain: 30,
        unitPrice: 540000,
        clockTypeId: newClockTypeData._id,
        providerId: newProviderData._id,
        materialId: newMaterialData._id,
      })
      let newClockData = await newClock.save()

      const newCart = new Cart({
        user: newUserData._id,
        clockId: newClockData._id,
      })
      const newCartData = await newCart.save()
      // ====
      const newPayment = new Payment({
        type: "MOMO",
        accountNumber: "0123456789",
        cardNumber: "0000000",
        qrCode: "http://www.example.com/qrcode1",
      })
      const newPaymentData = await newPayment.save()
      // ====
      const newOrder = new Order({
        user: newUserData._id,
        status: "READY",
        discount: 10,
        discountType: "PERCENT",
        paymentMethod: newPaymentData._id,
      })
      const newOrderData = await newOrder.save()
      // ====
      const newOrderDetail = new OrderDetail({
        orderId: newOrderData._id,
        clockId: newClockData._id,
        quantity: 2,
      })
      const newOrderDetailData = await newOrderDetail.save()

      res.json({
        statusCode: 200,
        status: "success",
        message: "generated successfully",
        data: {
          user: newUserData,
          clock: newClockData,
          clockType: newClockTypeData,
          provider: newProviderData,
          material: newMaterialData,
          cart: newCartData,
          payment: newPaymentData,
          order: newOrderData,
          orderDetail: newOrderDetailData,
        },
      })
    } catch (error) {
      console.log(error)
      res.json({
        statusCode: 500,
        status: "error",
        message: error.message,
      })
    }
  }

  // [GET] /findById?id=[id]
  async findById(req, res, next) {
    try {
      const {id} = req.query
      const result = await User.findById(id)
      console.log(">>> / file: site.controller.js / line 28 / result", result)
      if (result) {
        res.json({
          statusCode: 200,
          status: "SUCCESS",
          message: "findById",
          data: result,
        })
      } else {
        res.json({
          statusCode: 400,
          status: "FAIL",
          message: "not found",
        })
      }
    } catch (error) {
      res.json({
        statusCode: 400,
        status: "FAIL",
        message: "not found",
      })
    }
  }
}

module.exports = new SiteController()
