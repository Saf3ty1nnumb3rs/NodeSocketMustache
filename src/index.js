const express = require('express')
const socketio = require('socket.io')
const path = require('path')
const http = require('http')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const connectDB = require('./db/db')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

// connectDB()

const publicDirectoryPath = path.join(__dirname, '../public')

const PORT = process.env.PORT || 3000

app.use(express.static(publicDirectoryPath))

app.use(express.json({ extended: false }))

// When client connects with server
io.on('connection', socket => {
  console.log('New connection established')
  // JOIN - USER ENTERS ROOM
  socket.on('join', ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room })
    if (error) {
      return callback(error)
    }
    socket.join(user.room)
    // socket.emit, io.emit, socket.broadcast.emit
    // io.to.emit, socket.broadcast.to.emit
    socket.emit('message', generateMessage('Admin', 'Welcome! you are now connected...'))
    socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined the room...`))
    io.to(user.room).emit('room_data', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })

    callback()
  })
  // SEND MESSAGE
  socket.on('send_message', (msg, callback) => {
    const user = getUser(socket.id)
    if (user) {
      const filter = new Filter()
      filter.removeWords('hell', 'sadist')
      io.to(user.room).emit('message', generateMessage(user.username, filter.clean(msg)))
    }

    callback()
  })
  // SHARE LOCATION - show map of location
  socket.on('send_location', (coords, callback) => {
    const user = getUser(socket.id)
    if (user) {
      io.to(user.room).emit(
        'location_message',
        generateLocationMessage(user.username, `https://www.google.com/maps/place/${coords.lat},${coords.lon}`)
      )
      callback()
    }
  })
  // DISCONNECT - User leaves
  socket.on('disconnect', () => {
    const user = removeUser(socket.id)

    if (user) {
      io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left...`))
      io.to(user.room).emit('room_data', {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }
  })
})

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)
})
