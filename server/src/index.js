import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
const app = express();


app.use(cors());

const server = http.createServer(app);

const io = new Server("https://chat-app-learning.onrender.com", {
  cors: true
})

const userToSocketIdMap = new Map();
const socketIdtoUserMap = new Map();

io.on("connection", (socket) => {
  console.log(`User connected ${socket.id}`);

  socket.on("join:room", (data) => {
    const { user, room } = data;
    console.log(`User with name: ${user} joined room: ${room}`);

    userToSocketIdMap.set(user, socket.id);
    socketIdtoUserMap.set(socket.id, user);

    io.to(room).emit("user:joined", { user, id: socket.id })
    socket.join(room);

    io.to(socket.id).emit("join:room", data);
  })

  socket.on("user:call", ({ to, offer}) => {
    io.to(to).emit('incoming:call', { from: socket.id, offer});
  })

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit('call:accepted', { from: socket.id, ans});
  })

  socket.on('peer:nego:needed', ({ to, offer }) => {
    io.to(to).emit('peer:nego:needed', { from: socket.id, offer});
  })

  socket.on('peer:nego:done', ({ to, ans }) => {
    io.to(to).emit('peer:nego:final', { from: socket.id, ans});
  })

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  })

  socket.on("disconnect", ()=> {
    console.log("User disconnected", socket.id);
  })

})

/* server.listen(3000, () => {
  console.log(`Server is running on port: 3000`);
}) */