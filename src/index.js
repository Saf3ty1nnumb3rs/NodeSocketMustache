const express = require('express')
const socketio = require('socket.io')
const path = require('path')
const http = require('http')
const Filter = require('bad-words')
const { generateMessage } = require('./utils/messages')
const connectDB = require('./db/db')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

connectDB()

const publicDirectoryPath = path.join(__dirname, '../public')

const PORT = process.env.PORT || 3000

app.use(express.static(publicDirectoryPath))

app.use(express.json({ extended: false }))

let count = 0
// When client connects with server
io.on('connection', socket => {
  console.log('New connection established')
  socket.emit('message', generateMessage('Welcome! you are now connected...'))
  socket.broadcast.emit('welcomeMessage', generateMessage('A new user has joined...'))

  socket.on('send_message', (msg, callback) => {
    const filter = new Filter()
    filter.removeWords('hell', 'sadist')
    io.emit('message', filter.clean(msg))
    callback()
  })

  socket.on('disconnect', () => {
    io.emit('message', generateMessage('A user has left...'))
  })

  socket.on('send_location', (coords, callback) => {
    io.emit('location_message', `Location: https://www.google.com/maps/place/${coords.lat},${coords.lon}`)
    callback()
  })
})

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)
})
