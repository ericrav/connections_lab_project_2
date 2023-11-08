import { playNote } from './audio.js';
import { initFaceTracking } from './face-tracking.js';
import { state } from './state.js';
import { setupSocket } from './webrtc.js';

window.addEventListener('load', async () => {
  const videoEl = await setupWebcam();

  await initFaceTracking(videoEl);

  setupSocket(videoEl);
  renderFace(videoEl);
  playNote();
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
  const offscreen = new OffscreenCanvas(256, 256);
  const ctx = offscreen.getContext('2d');

  const canvas = document.getElementById('canvas');
  const ctx2 = canvas.getContext('2d');

  const loop = () => {
    console.log(state.box)
    requestAnimationFrame(loop);
    if (!state.box) return
    const { left, width, top, height } = state.box;
    ctx.drawImage(videoEl, left, top, width, height, 0, 0, 256, 256);
    ctx2.drawImage(offscreen, canvas.width / 2, canvas.height / 2, 256, 256);
  }
  requestAnimationFrame(loop);
}
