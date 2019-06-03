const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const {generateMessage} = require('./utils/messages')

const publicPath = path.join(__dirname, '../public')
const PORT = process.env.PORT || 3000
const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(publicPath))
//EDIT TEST WHY CONTRIBUTIONS AREN'T SHOWING

io.on('connection', (socket) => {

    socket.on('join', ({username, room}) => {
        socket.join(room)
        socket.emit('message', generateMessage(`Welcome to ${room}`))
        socket.broadcast.to(room).emit('message', generateMessage(`${username} has joined.`))
    })

    socket.on('sendMessage', (message, callback) => {
        io.to('A').emit('message', generateMessage(message))
        callback()
    })

    socket.on('disconnect', () => {
        socket.broadcast.emit('message', generateMessage('A user has left!'))
    })

    socket.on('sendLocation', (position, callback) => {
        io.emit('location', {url: `https://google.com/maps?q=${position.latitude},${position.longitude}`, createdAt: position.createdAt})
        callback('Location delivered')
    })
})

server.listen(PORT, () => {
    console.log('Listening on port', PORT)
})
