const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')

const publicPath = path.join(__dirname, '../public')
const PORT = process.env.PORT || 3000
const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(publicPath))


io.on('connection', (socket) => {
    console.log('New socketio connection')
    socket.emit('message', 'Welcome to the socket connection')
    socket.broadcast.emit('message', 'A new user has joined!')

    socket.on('sendMessage', (message) => {
        io.emit('message', message)
    })

    socket.on('disconnect', () => {
        socket.broadcast.emit('message', 'A user has left!')
    })
})

server.listen(PORT, () => {
    console.log('Listening on port', PORT)
})
