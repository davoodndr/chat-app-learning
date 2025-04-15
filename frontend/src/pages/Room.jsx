import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../provider/SocketProvider'
import ReactPlayer from 'react-player'
import peer from '../services/peer';

export const Room = () => {

  const socket = useSocket();

  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const handleUserJoined = useCallback(({user, id}) => {
    console.log(`User named '${user}' joined the room`)
    setRemoteSocketId(id);
  },[]);

  const handleCallUser = useCallback(async () => {
    /* navigator.mediaDevices.enumerateDevices()
    .then(devices => {
      devices.forEach(device => console.log(device.label))
    }); */
    const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  },[remoteSocketId, socket]);

  const handleIncomingCall = useCallback(async({ from, offer }) => {
    setRemoteSocketId(from);
    const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
    setMyStream(stream);

    console.log('Incoming call', from, offer)
    const ans = await peer.getAnswer(offer);
    socket.emit("call:accepted", { to: from, ans });
  },[socket])

  const sendStreams = useCallback(() => {
    for(const track of myStream.getTracks()){
      peer.peer.addTrack(track, myStream);
    }
  },[myStream])

  const handleCallAccepted = useCallback(async({ from, ans }) => {
    await peer.setLocalDescription(ans);
    console.log('Call accepted!')
    sendStreams();
  },[sendStreams]);

  const handleNegoNeeded = useCallback(async() => {
    const offer = await peer.getOffer();
    socket.emit('peer:nego:needed', { offer, to: remoteSocketId });
  },[remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener('negotiationneeded', handleNegoNeeded);

    return () => {
      peer.peer.removeEventListener('negotiationneeded', handleNegoNeeded);
    }

  },[handleNegoNeeded]);

  useEffect(() => {
    peer.peer.addEventListener('track', async ev => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!")
      setRemoteStream(remoteStream[0]);
    })
  },[])

  const handleNegoNeedIncoming = useCallback(async({ from, offer }) => {
    const ans = await peer.getAnswer(offer);
    socket.emit('peer:nego:done', { to: from, ans });
  }, [socket]);

  const handleNegoFinal = useCallback(async({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);
  

  useEffect(() => {
    socket.on("user:joined", handleUserJoined)
    socket.on("incoming:call", handleIncomingCall)
    socket.on("call:accepted", handleCallAccepted)
    socket.on("peer:nego:needed", handleNegoNeedIncoming)
    socket.on("peer:nego:final", handleNegoFinal)


    return () => {
      socket.off('user:joined', handleUserJoined)
      socket.off("incoming:call", handleIncomingCall)
      socket.off("call:accepted", handleCallAccepted)
      socket.off("peer:nego:needed", handleNegoNeedIncoming)
      socket.off("peer:nego:final", handleNegoFinal)
    }

  },[socket, handleUserJoined, handleIncomingCall, handleCallAccepted, handleNegoNeedIncoming, handleNegoFinal])

  return (
    <div className='room'>
      <h2>Room</h2>
      <h3>{remoteSocketId ? 'Connected' : 'No one in room'}</h3>
      {remoteSocketId && <button onClick={handleCallUser}>CALL</button>}
      {myStream && <button onClick={sendStreams}>Send Stream</button> }
      {myStream &&
        <>
        <h5>My Stream</h5>
        <ReactPlayer 
          url={myStream} 
          width="300px"
          playing
          />
        </>
      }
      {remoteStream && 
        <>
          <h5>Remote Stream</h5>
          <ReactPlayer 
          url={remoteStream} 
          width="300px"
          playing
          />
        </>
      }
    </div>
  )
}
