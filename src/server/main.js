const express = require('express');
const ViteExpress = require("vite-express");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

ViteExpress.listen(app, port, () => {
  const domain = `http://localhost:${port}`;
  console.log(`Server is listening at ${domain}`);
});
