import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';

const socket = io('http://localhost:5000');

const Video = () => {
  const [myStream, setMyStream] = useState(null);
  const [peerStream, setPeerStream] = useState(null);
  const [incomingCall, setIncomingCall] = useState(false);
  const [caller, setCaller] = useState('');
  const [incomingSignal, setIncomingSignal] = useState(null);

  const peerRef = useRef();
  const myVideo = useRef(null);
  const peerVideo = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setMyStream(stream);
        socket.emit('join', socket.id);
      })
      .catch(err => console.error('Error accessing media devices:', err));

    socket.on('incomingCall', (data) => {
      setCaller(data.from);
      setIncomingSignal(data.signal); // Set incoming signal when receiving a call
      setIncomingCall(true);
    });

    socket.on('callAccepted', (signal) => {
      peerRef.current.signal(signal);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const callUser = (id) => {
    const peer = new Peer({ initiator: true, trickle: false, stream: myStream });

    peer.on('signal', (data) => {
      socket.emit('callUser', { userToCall: id, signalData: data, from: socket.id });
    });

    peer.on('stream', (stream) => {
      setPeerStream(stream);
    });

    socket.on('callAccepted', (signal) => {
      peer.signal(signal);
    });

    peerRef.current = peer;
  };

  const answerCall = () => {
    const peer = new Peer({ initiator: false, trickle: false, stream: myStream });

    peer.on('signal', (data) => {
      socket.emit('answerCall', { signal: data, to: caller });
    });

    peer.on('stream', (stream) => {
      setPeerStream(stream);
    });

    peer.signal(incomingSignal);

    peerRef.current = peer;
  };

  return (
    <div>
      {incomingCall && (
        <div>
          <h1>Incoming Call from {caller}</h1>
          <button onClick={answerCall}>Answer</button>
        </div>
      )}
      <video autoPlay ref={myVideo} />
      {peerStream && <video autoPlay ref={peerVideo} />}
      <button onClick={() => callUser('user2')}>Call User2</button>
    </div>
  );
}

export default Video;
