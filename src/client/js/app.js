import { initFaceTracking } from './face-tracking.js';
import { state } from './state.js';
import { setupSocketsAndRTC } from './webrtc.js';

window.addEventListener('load', async () => {
  const videoEl = await setupWebcam();

  await initFaceTracking(videoEl);

  setupSocketsAndRTC();
  renderFace(videoEl);
  // playNote();
});

async function setupWebcam() {
  const videoEl = document.getElementById('webcam');

  const stream = await navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .catch((err) => {
      console.error(err);
      alert('To play, please enable camera access in your browser settings');
    });
  videoEl.srcObject = stream;

  return videoEl;
}

function renderFace(videoEl) {
  const offscreen = state.controller.offscreen;
  const ctx = offscreen.getContext('2d');

  const canvas = document.getElementById('canvas');
  const ctx2 = canvas.getContext('2d');

  const loop = () => {
    const { x, y, width, height } = state.controller.boundingBox;
    ctx.drawImage(videoEl, x, y, width, height, 0, 0, 256, 256 * (height / width));

    // ctx.save();
    // ctx.translate(128, 128);
    // ctx.scale(256/width*2, 256/height*2);
    // ctx.translate(-128, -128);
    // ctx.beginPath();
    // ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    // state.controller.facePath.forEach((p) => {
    //   ctx.lineTo(p.x * 256, p.y * 256);
    // });
    // ctx.closePath();
    // ctx.fill();
    // ctx.restore();

    ctx2.drawImage(offscreen, canvas.width / 2, canvas.height / 2, 256, 256);


    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
