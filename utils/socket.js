const {userJoin, getCurrentUser, userLeave, getRoomUsers, getSocketUser, userOn} = require("../utils/usersGroupRealtime");
const socketio = require('socket.io');
const express = require('express');
const http = require('http');
const cors = require('cors');

const app = express();

const server = http.createServer(app);
const io = socketio(server);

// Cors
app.use(cors);

// format message
const moment = require('moment');
// require('moment-timezone');
const botName = 'Nhom4';

function formatMessage(userId, username, avatar, room, typeRoom, publicKey, text, typeMess) {
  return {
    room: room,
    username: username,
    text: text,
    userId: userId,
    avatar: avatar,
    typeMess: typeMess,
    typeRoom: typeRoom,
    publicKey: publicKey,
    time: moment().utc().format('YYYY-MM-DDTHH:mm:ss.SSSZ')
  };
}

// open socket 
io.on('connection', function(socket){
    console.log("one user connection")
    socket.on("online", ({userId}) => {
        const user = userOn(socket.id, userId);
        if(user){
            console.log("user: ",user.userId ," online");
        }
    })
    socket.on("joinRoom", ({userId, username, avatar, room, typeRoom, publicKey}) => {
        const user = userJoin(socket.id, userId, username, avatar, room, typeRoom, publicKey);

        if (user) {
            socket.join(user.room);
            console.log("user: ",user.username ," join room:", user.room);
        }
        
        // socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));
        // socket.broadcast
        // .to(user.room)
        // .emit(
        //     'message',
        //     formatMessage(botName, `${user.username} has joined the chat`)
        // )

        // // Send users and room info
        // io.to(user.room).emit('roomUsers', {
        //     room: user.room,
        //     users: getRoomUsers(user.room)
        // });
    })
    socket.on('leaveRoom', ({username, room}) => {
        const user = userLeave(socket.id, username, room);
        socket.leave(user.room);
        console.log("user:",user.username ,"leave room:", user.room);
    })

    socket.on('chatMessage', ({msg,typeMess, room}) => {
        const user = getCurrentUser(socket.id, room);
        console.log("user:",user);
        socket.to(user.room).emit('message', formatMessage(user.userId, user.username, user.avatar, user.room, user.typeRoom, user.publicKey, msg, typeMess));
        console.log("user:",user.username ,"send MSG:",msg,"to room:", user.room);
    })
    socket.on('createRoom', ({userIds}) => {
        userIds.forEach((userId, index) => {
            console.log(`User ID ${index + 1}: ${userId}`);
            // Ở đây, bạn có thể thực hiện các xử lý liên quan đến từng userId
            const socketID = getSocketUser(userId);
            if (socketID != null) {
                console.log("socketID: ",socketID);
                socket.to(socketID).emit('addRoom')
            }
          });
    })
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if(user){
            // io.to(user.room).emit(
            //     'message',
            //     formatMessage(botName, `${user.username} has left the chat`)
            // );

             // Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    })
});

const PORT = 16000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));