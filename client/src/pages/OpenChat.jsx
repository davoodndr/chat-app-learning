import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../provider/SocketProvider';
import { useNavigate } from 'react-router';

function OpenChat() {

  const [user, setUser] = useState("");
  const [room, setRoom] = useState("");

  const socket = useSocket();
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    
    if(user && room){
      socket.emit("join:room", { user, room });
    }

  }, [user, room, socket]);

  const handleJoin = useCallback((data) => {
    const { user, room } = data;
    navigate(`/room/${room}`)
  },[navigate])

  useEffect(() => {

    socket.on("join:room",handleJoin)

    return () => {
      socket.off("join:room", handleJoin)
    }

  },[socket, handleJoin])

  return (
    <div className="join-chat">
      <div className='join-chat-container'>
        <h2>Join a chat</h2>
        <input type="text" placeholder='John...' value={user} onChange={e => setUser(e.target.value)} />
        <input type="text" placeholder='Room...' value={room} onChange={e => setRoom(e.target.value)} />
        <button onClick={handleClick}>Join</button>
      </div>
    </div>
  )
}

export default OpenChat