const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

app.listen(port, () => {
  const domain = `http://localhost:${port}`;
  console.log(`Server is listening at ${domain}`);
});
