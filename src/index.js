const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const {generateMessage} = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

const publicPath = path.join(__dirname, '../public')
const PORT = process.env.PORT || 3000
const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(publicPath))
io.on('connection', (socket) => {

    socket.on('join', ({username, room}, callback) => {
        const {error, user} = addUser({id: socket.id, username, room})
        if (error) {
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('message', generateMessage('System', `Welcome to ${user.room}`))
        socket.broadcast.to(user.room).emit('message', generateMessage('System', `${user.username} has joined.`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        if (!user) {
            return callback('Error: user not found')
        }
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('System', `${user.username} has left.`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

    socket.on('sendLocation', (position, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('location', {username: user.username, url: `https://google.com/maps?q=${position.latitude},${position.longitude}`, createdAt: position.createdAt})
        callback('Location delivered')
    })
})

server.listen(PORT, () => {
    console.log('Listening on port', PORT)
})
