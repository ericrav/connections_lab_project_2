// @ts-check
import SimplePeer from 'simple-peer';
import { io } from 'socket.io-client';

import global from 'global';
import * as process from 'process';
import { Player, addPlayer, removePlayer, state } from './state';

// Fix simple-peer for Vite https://github.com/feross/simple-peer/issues/823
global.process = process;

let socket;

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
        setupConnection(true, otherId);
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
    const player = state.players[from];
    //if peer exists in the peers object, send signal to it
    if (player) {
      const connection = player.simplePeer;
      connection.signal(data);
      //otherwise setup connection to that particular peer
    } else {
      //create a new object, it won't be the initiator, another peer will call us
      const theirSocketId = from;
      const peerConnection = setupConnection(false, theirSocketId);
      //attempt to establish a connection with the new peer that sent the initial signal
      console.log('Connecting to a new peer!');
      peerConnection.signal(data);
    }
  });

  /*STEP 7. Setup peer connection*/
  function setupConnection(initiator, theirSocketId) {
    /*STEP 7.1. Create a new peer connection object */
    const peerConnection = new SimplePeer({ initiator });
    const player = new Player(theirSocketId, peerConnection);
    addPlayer(theirSocketId, player);

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
      player.addMediaStream(stream);
    });

    /*STEP 7.6. When peer connection closes*/
    peerConnection.on('close', () => {
      console.log('Peer connection is closing');
      removePlayer(theirSocketId);
    });

    //on error
    peerConnection.on('error', (err) => {
      console.log(err);
    });

    /*STEP 7.7. Return peer connection to be able to use it elsewhere in STEP 6.4.3*/
    return peerConnection;
  }
}
