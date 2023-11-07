// @ts-check
import { io } from 'socket.io-client';

let socket;
const peers = {};

/*Step 6. Establish socket connection*/
export function setupSocket() {
  /*STEP 6.1. Set to global object variable*/
  socket = io();

  socket.on('connect', () => {
    console.log('Client connected!');
    console.log('My socket id is: ', socket.id);

    /*STEP 6.2. Tell the server we want a list of all users*/
    socket.emit('list');
  });

  /*STEP 6.4. Receive a list of all socket ids*/
  socket.on('listresults', (data) => {
    //array of socket ids
    console.log(data);
    //6.4.1. Loop through all ids
    for (let i = 0; i < data.length; i++) {
      //6.4.2. Make sure the id is not my own id
      if (data[i] != socket.id) {
        let theirSocketId = data[i];
        //call all peer connections (since we are have just joined, we will be the initiator to connect with everyone else on the call)
        // let peerConnection = setupConnection(true, theirSocketId);
        //6.4.3. Add to global peer connections object
        // myFriends[data[i]] = peerConnection;
      }
    }
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
      // let peerConnection = setupConnection(false, theirSocketId);
      //add new connection to a global 'peers' object
      // myFriends[from] = peerConnection;
      //attempt to establish a connection with the new peer that sent the initial signal
      // console.log('Connecting to a new peer!');
      // peerConnection.signal(data);
    }
  });
}
