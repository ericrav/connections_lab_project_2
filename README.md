## Set up

```sh
npm install
npm run dev
```

Open project at http://localhost:3000

### Run with HTTPS locally

First create `cert.pem` & `key.pem` following CLI prompts

```
openssl req -x509 -newkey rsa:2048 -keyout keytmp.pem -out cert.pem -days 365
openssl rsa -in keytmp.pem -out key.pem
```

Run server:

```
USE_HTTPS=1 npm run dev
```

Open project at https://localhost:3000 (& ignore browser's security warning)

## Libraries Used

- [face-api](https://github.com/justadudewhohacks/face-api.js)
- [Tone](https://tonejs.github.io/)
- [Express](https://expressjs.com/)

### Build Tools

- [Vite](https://vitejs.dev/)
- [vite-express](https://github.com/szymmis/vite-express)
