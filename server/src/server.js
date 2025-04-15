import express from 'express';
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // adjust in production
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("🧠 New client:", socket.id);

  socket.on("join", (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-joined", socket.id);
  });

  socket.on("signal", ({ roomId, data }) => {
    socket.to(roomId).emit("signal", { sender: socket.id, data });
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

const PORT = 5000;
server.listen(PORT,"0.0.0.0", () => console.log(`✅ Signaling server running on port ${PORT}`));