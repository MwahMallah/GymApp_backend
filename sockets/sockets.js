require('socket.io');
const Message = require('../models/message');

function initWebSockets(io) {
    io.on('connection', (socket) => {
        socket.on('disconnect', () => {
            console.log('disonnected', socket.id);
        });
    
        socket.on('joinRoom', (room) => {
            socket.join(room);
        });

        socket.on('sawMessage', (msg) => {
            const {to, from} = msg;
            const roomName = [to, from].sort().join('-');
            const seenMessage = {...msg, seen: true};

            socket.to(roomName).emit('sawMessage', seenMessage);
        });
    
        socket.on('usrMessage', (msg) => {
            const {to, from} = msg;
            const roomName = [to, from].sort().join('-');
            const new_msg = new Message(msg);
    
            new_msg.save().then((saved_msg) => {
                io.to(roomName).emit('sendMessage', saved_msg);
            });
        })
    });
}

module.exports = initWebSockets;