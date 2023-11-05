const express = require('express');
const https = require('https');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

const server = process.env.USE_HTTPS
  ? (() => {
      const key = fs.readFileSync('./key.pem');
      const cert = fs.readFileSync('./cert.pem');
      https.createServer({ key: key, cert: cert }, app);
    })()
  : app;

server.listen(port, () => {
  const domain = `${process.env.USE_HTTPS ? 'https' : 'http'}://localhost:${port}`;
  console.log(`Server is listening at ${domain}`);
});
