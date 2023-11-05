import { playNote } from './audio.js';
import { initFaceTracking } from './face-tracking.js';

window.addEventListener('load', async () => {
  const videoEl = await setupWebcam();

  await initFaceTracking(videoEl);
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
