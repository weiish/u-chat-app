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


io.on('connection', (socket) => {
    console.log('New socketio connection')
    socket.emit('message', generateMessage('Welcome to the socket connection'))
    socket.broadcast.emit('message', generateMessage('A new user has joined!'))

    socket.on('sendMessage', (message, callback) => {
        io.emit('message', generateMessage(message))
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
