const  dotenv =require('dotenv');

dotenv.config({ path: './config.env' });

const { Server } = require('socket.io');
const io = new Server(8000, {
    cors: {
        "version": 2,
        "routes": [
            {
                "src": "/socket.io",
                "headers": {
                    "Access-Control-Allow-Origin": `${process.env.FRONTEND_URL}`
                }
            }
        ]
    }
});

const emailToSocketId = new Map();
const socketIdToEmail = new Map();



io.on("connection", (socket) => {
    // console.log("Socket connected ",socket.id);
    socket.on("room:join", (data) => {
        const { email, room } = data;
        emailToSocketId.set(email, socket.id);
        socketIdToEmail.set(socket.id, email);
        io.to(room).emit("user:joined", { email, id: socket.id });
        socket.join(room);
        io.to(socket.id).emit("room:join", data);
    });

    socket.on('user:call', ({ to, offer }) => {
        io.to(to).emit('incomming:call', { from: socket.id, offer });
    });

    socket.on('call:accepted', ({ to, ans }) => {
        io.to(to).emit('call:accepted', { from: socket.id, ans });
    });

    socket.on('peer:nego:needed', ({ to, offer }) => {
        io.to(to).emit('peer:nego:needed', { from: socket.id, offer });
    });
    socket.on('peer:nego:done', ({ to, ans }) => {
        io.to(to).emit('peer:nego:final', { from: socket.id, ans });
    });

});

