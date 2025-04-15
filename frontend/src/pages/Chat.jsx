import React, { useEffect, useState } from 'react'
import ScrollToBottom from 'react-scroll-to-bottom'

function Chat({socket, username, room}) {

  const [currentMsg, setCurrentMsg] = useState("");
  const [msgList, setMsgList] = useState([]);

  const sendMsg = async() => {
    if(currentMsg){
      const messageData = {
        room,
        author: username,
        message: currentMsg,
        time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
        key: new Date(Date.now()).getMilliseconds()
      }

      await socket.emit("send_message", messageData)
      setMsgList(prev => [...prev, messageData])
      setCurrentMsg("");
    }
  }

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMsgList(prev => [...prev,data])
    })
  }, [socket])

  return (
    <div className='chat-box'>
      <div className='chat-header'>
        <p>Live Chat</p>
      </div>
      <div className='chat-body'>
        <ScrollToBottom className='msg-container'>
          {msgList.map(msg => 
            <div key={msg.key} className={`message-bubble ${msg.author === username ? 'right' : ''}`}>
              {msg.author !== username && <p className='author'>{msg.author}</p>}
              <p className='message'>{msg.message}</p>
              <p className='msg-time'>{msg.time}</p>
            </div>
          )}
        </ScrollToBottom>
      </div>
      <div className='chat-footer'>
        <input type="text" placeholder='Hey...' value={currentMsg} 
          onChange={e => setCurrentMsg(e.target.value)} 
          onKeyDown={e => {
            e.key === 'Enter' && sendMsg()
          }}/>
        <button onClick={sendMsg}>Send</button>
      </div>
    </div>
  )
}

export default Chat