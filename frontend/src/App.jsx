
import { useState } from 'react';
import './App.css'
import { io } from 'socket.io-client'
import Chat from './pages/Chat';

const socket = io("http://localhost:3000");

function App() {

  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

  const joinRoom = () => {
    if(username && room){
      socket.emit("join_room", room);
      setShowChat(true)
    }
  }

  return (
    <div className='chat-window'>
      {!showChat ? (
        <div className="join-chat-container">
          <h2>Join a chat</h2>
          <input type="text" placeholder='John...' onChange={e => setUsername(e.target.value)} />
          <input type="text" placeholder='Room...' onChange={e => setRoom(e.target.value)} />
          <button onClick={joinRoom}>Join</button>
        </div>
      ) : (
        
        <Chat socket={socket} username={username} room={room} />
      )}

    </div>
  )
}

export default App
