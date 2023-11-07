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
  });
}

module.exports = { usePeers };
