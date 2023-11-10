// @ts-check
import * as faceapi from 'face-api.js';
import { initFaceTracking } from './face-tracking.js';
import { state } from './state.js';
import { setupSocketsAndRTC } from './webrtc.js';

window.addEventListener('load', async () => {
  await initFaceTracking();

  setupSocketsAndRTC();

  gameLoop();
});

document.getElementById('start_btn').addEventListener('click', () => {
  document.getElementById('overlay').remove();
});

function gameLoop() {
  const canvas = /** @type {HTMLCanvasElement} */ (
    document.getElementById('canvas')
  );
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  drawFaceJoystick(ctx);

  {
    state.controller.avatar.update();
    const { x, y } = state.controller.avatar.position;
    renderFace(ctx, state.controller.offscreen, x, y);
  }

  Object.values(state.players).forEach((player, i) => {
    if (!player.videoEl) return;

    const { x, y } = player.avatar.position;
    renderFace(ctx, player.videoEl, x, y);
  })

  requestAnimationFrame(gameLoop);
}

const size = 128;
/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {CanvasImageSource} imageSource
 * @param {number} posX
 * @param {number} posY
 */
function renderFace(ctx, imageSource, posX, posY) {
  ctx.save();
  ctx.beginPath();
  const r = size / 2;
  ctx.arc(posX, posY, r, 0, 2 * Math.PI);
  ctx.clip();
  ctx.drawImage(imageSource, posX - r, posY - r, size, size);
  ctx.restore();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 */
function drawFaceJoystick(ctx) {
  const webcam = /** @type {HTMLVideoElement} */(document.getElementById('webcam'));

  const stream = /** @type {MediaStream} */ (webcam.srcObject);
  if (!stream) return;
  const aspectRatio = stream.getTracks()[0].getSettings().aspectRatio;
  const webcamScale = 480;


  ctx.save();
  ctx.scale(-1, 1);
  ctx.translate(-webcamScale, 0);

  if (state.result) {
    ctx.save();
    ctx.globalAlpha = state.result.detection.score * 0.75;
    faceapi.draw.drawFaceLandmarks(ctx.canvas, state.result);
    ctx.restore();
  }

  {
    ctx.globalAlpha = 1;
    const { x, y } = state.controller.nosePoint;
    ctx.fillStyle = '#30bbf4';
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, 2 * Math.PI);
    ctx.fill();
  }


  ctx.globalAlpha = 0.25;
  ctx.drawImage(webcam, 0, 0, webcamScale, webcamScale / aspectRatio);
  ctx.restore();
}
