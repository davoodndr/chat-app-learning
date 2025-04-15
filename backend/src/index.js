import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
const app = express();


app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: true
})

io.on("connection", (socket) => {
  console.log(`User connected ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  })

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  })

  socket.on("disconnect", ()=> {
    console.log("User disconnected", socket.id);
  })

})

server.listen(3000, () => {
  console.log(`Server is running on port: 3000`);
})