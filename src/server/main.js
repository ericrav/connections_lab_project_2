const http = require('http');
const https = require('https');
const fs = require('fs');
const express = require('express');
const ViteExpress = require('vite-express');

const { usePeers } = require('./peers');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

const { USE_HTTPS } = process.env;

const server = USE_HTTPS
  ? (() => {
      const key = fs.readFileSync('./key.pem');
      const cert = fs.readFileSync('./cert.pem');
      return https.createServer({ key: key, cert: cert }, app);
    })()
  : (() => {
      return http.createServer(app);
    })();

// set up websocket server for WebRTC signaling
usePeers(server);

server.listen(port, () => {
  const domain = `${USE_HTTPS ? 'https' : 'http'}://localhost:${port}`;
  console.log(`Server is listening at ${domain}`);
});

ViteExpress.config({
  inlineViteConfig: {
    resolve: {
      alias: {
        'readable-stream': 'vite-compatible-readable-stream',
      },
    },
  },
});

ViteExpress.bind(app, server);
