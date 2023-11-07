const { Server } = require('socket.io');

const peers = {};

function usePeers(httpsServer) {
  const io = new Server(httpsServer);

  io.sockets.on('connection', (socket) => {
    console.log('a user connected:', socket.id);

    peers[socket.id] = socket;

    socket.on('disconnect', () => {
      console.log('user disconnected');
      delete peers[socket.id];
    });

    /*STEP 6.3. Listen and get all peer ids*/
    socket.on('list', () => {
      //get an ids array
      let ids = Object.keys(peers);
      console.log(ids);

      //send all existing socket ids to this specific socket
      socket.emit('listresults', ids);
    });

    /*STEP 7.3. Relay signals back and forth*/
    socket.on('signal', (to, from, data) => {
      console.log('signal', to);

      //check if such peer exists in a 'peers' object
      if (to in peers) {
        //send signal to that peer
        peers[to].emit('signal', to, from, data);
      } else {
        console.log('Peer not found');
      }
    });
  });
}

module.exports = { usePeers };
