// @ts-check
import SimplePeer from 'simple-peer';
import { io } from 'socket.io-client';

import global from 'global';
import * as process from 'process';
import { state } from './state';

// Fix simple-peer for Vite https://github.com/feross/simple-peer/issues/823
global.process = process;

let socket;
const peers = {};

/*Step 6. Establish socket connection*/
export function setupSocketsAndRTC() {
  /*STEP 6.1. Set to global object variable*/
  socket = io();

  socket.on('connect', () => {
    console.log('Client connected!');
    console.log('My socket id is: ', socket.id);

    /*STEP 6.2. Tell the server we want a list of all users*/
    socket.emit('list');
  });

  /* Receive a list of all socket ids */
  socket.on('listresults', (socketIds) => {
    socketIds.forEach((otherId) => {
      // Make sure the id is not my own id
      if (otherId !== socket.id) {
        //call all peer connections (since we are have just joined, we will be the initiator to connect with everyone else on the call)
        let peerConnection = setupConnection(true, otherId);
        peers[otherId] = peerConnection;
      }
    });
  });

  /*STEP 7.4. Receive signal or setup a new peer connection*/
  socket.on('signal', (to, from, data) => {
    console.log('Got a signal from the server: ', to, from, data);
    //'to' should be us
    if (to != socket.id) {
      console.log("Socket ids don't match");
    }

    //look for the right simplepeer in our array
    let connection = peers[from];
    //if peer exists in the peers object, send signal to it
    if (connection) {
      connection.signal(data);
      //otherwise setup connection to that particular peer
    } else {
      console.log('Never found right simplepeer object');
      //create a new object, it won't be the initiator, another peer will call us
      let theirSocketId = from;
      let peerConnection = setupConnection(false, theirSocketId);
      //add new connection to a global 'peers' object
      peers[from] = peerConnection;
      //attempt to establish a connection with the new peer that sent the initial signal
      console.log('Connecting to a new peer!');
      peerConnection.signal(data);
    }
  });

  /*STEP 7. Setup peer connection*/
  function setupConnection(initiator, theirSocketId) {
    /*STEP 7.1. Create a new peer connection object */
    const peerConnection = new SimplePeer({ initiator });

    /*STEP 7.2. Simplepeer generates signals which need to be sent across socket connection*/
    peerConnection.on('signal', (data) => {
      //Emit a signal event to the server
      socket.emit('signal', theirSocketId, socket.id, data);
    });

    /*STEP 7.5. When we have a connection, send our stream*/
    peerConnection.on('connect', () => {
      console.log('connect');
      console.log(peerConnection);

      //Let's give them our stream - add to the peer connection
      peerConnection.addStream(state.controller.offscreen.captureStream());
      console.log('Send our stream');
    });

    /*STEP 7.6. Stream is coming to us*/
    peerConnection.on('stream', (stream) => {
      console.log('Incoming Stream');

      //create a new video object
      let theirVideoEl = document.createElement('video');
      theirVideoEl.id = theirSocketId;
      theirVideoEl.srcObject = stream;
      theirVideoEl.muted = true;
      theirVideoEl.onloadedmetadata = (e) => {
        theirVideoEl.play();
      };
      //attach to html
      document.body.appendChild(theirVideoEl);
    });

    /*STEP 7.6. When peer connection closes*/
    peerConnection.on('close', () => {
      console.log('Peer connection is closing');
      //Additionally can remove from the myFriends object
    });

    //on error
    peerConnection.on('error', (err) => {
      console.log(err);
    });

    /*STEP 7.7. Return peer connection to be able to use it elsewhere in STEP 6.4.3*/
    return peerConnection;
  }
}
