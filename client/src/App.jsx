

import './App.css'
import OpenChat from './pages/OpenChat';
import Chat from './pages/Chat'
import { Route, Routes } from 'react-router';
import { Room } from './pages/Room';
import { useEffect, useRef, useState } from 'react';
import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:5000"; // Your signaling server
const ROOM_ID = "test-room"; // Customize per session

function App() {

  const localVideo = useRef();
  const remoteVideo = useRef();
  const peerConnection = useRef(null);
  const socket = useRef(null);

  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.current = io(SERVER_URL);
    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localVideo.current.srcObject = stream;
        stream.getTracks().forEach(track => {
          peerConnection.current.addTrack(track, stream);
        });
      });

    peerConnection.current.ontrack = (event) => {
      remoteVideo.current.srcObject = event.streams[0];
    };

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.current.emit("signal", {
          roomId: ROOM_ID,
          data: { type: "candidate", candidate: event.candidate }
        });
      }
    };

    // Join room
    socket.current.emit("join", ROOM_ID);

    // When another user joins
    socket.current.on("user-joined", async () => {
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      socket.current.emit("signal", {
        roomId: ROOM_ID,
        data: { type: "offer", sdp: offer }
      });
    });

    // Handle incoming signals
    socket.current.on("signal", async ({ data }) => {
      if (data.type === "offer") {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.current.emit("signal", {
          roomId: ROOM_ID,
          data: { type: "answer", sdp: answer }
        });
      }

      if (data.type === "answer") {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
      }

      if (data.type === "candidate") {
        try {
          await peerConnection.current.addIceCandidate(data.candidate);
        } catch (err) {
          console.error("Error adding received ICE candidate", err);
        }
      }
    });

    setConnected(true);

    return () => {
      socket.current.disconnect();
    };
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h2>React WebRTC Chat</h2>
      {connected ? <p>✅ Connected to room "{ROOM_ID}"</p> : <p>Connecting...</p>}
      <div style={{ display: "flex", justifyContent: "center", gap: "2rem" }}>
        <div>
          <h4>Local</h4>
          <video ref={localVideo} autoPlay playsInline muted width="300" />
        </div>
        <div>
          <h4>Remote</h4>
          <video ref={remoteVideo} autoPlay playsInline width="300" />
        </div>
      </div>
    </div>
  );

  /* return (
    <div className='app'>
      <Routes>
        <Route path='/' element={<OpenChat />}/>
        <Route path='/room/:id' element={<Room />}/>
        <Route path='/chat' element={<Chat />}/>
      </Routes>
    </div>
  ) */
}

export default App
