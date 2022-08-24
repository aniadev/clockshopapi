const cors = require("cors")

const tokenParser = require("../../utils/tokenParser")

const onlineUsers = []

socketIO = (app, mongodb) => {
  var server = require("http").Server(app)
  var io = require("socket.io")(server, {
    cors: {
      origin: "*",
    },
  })
  // midlleware
  io.use((socket, next) => {
    tokenParser(socket)
    next()
  })
  //
  io.on("connect", (socket) => {
    console.log("Socket ID connected: ", socket.id, socket.userData.userId)
    onlineUsers.push({
      socketId: socket.id,
      userId: socket.userData.userId,
      name: socket.userData.name,
      avatar: socket.userData.avatar,
    })
    socket.emit("online", onlineUsers)
    console.log("online: ", onlineUsers.length)

    socket.on("disconnect", () => {
      onlineUsers.forEach((user, index) => {
        if (user.socketId === socket.id) {
          onlineUsers.splice(index, 1)
        }
      })
      console.log("online: ", onlineUsers.length)
      socket.emit("online", onlineUsers)
    })
    socket.on("hello", (arg) => {
      console.log(arg) // world
      socket.emit("server", "Server received message: ", arg)
    })
  })

  const port = process.env.IOPORT || 8598
  server.listen(port, () => {
    console.log(`SocketIO listening on port ${port}`)
  })
}

module.exports = socketIO
