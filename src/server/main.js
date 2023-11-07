const https = require('https');
const fs = require('fs');
const express = require('express');
const ViteExpress = require('vite-express');

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
  : app;

server.listen(port, () => {
  const domain = `${USE_HTTPS ? 'https' : 'http'}://localhost:${port}`;
  console.log(`Server is listening at ${domain}`);
});

ViteExpress.bind(app, server);
