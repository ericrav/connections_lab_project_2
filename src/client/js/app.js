import { initFaceTracking } from './face-tracking.js';
import { state } from './state.js';
import { setupSocketsAndRTC } from './webrtc.js';

window.addEventListener('load', async () => {
  await initFaceTracking();

  setupSocketsAndRTC();

  gameLoop();
});

function gameLoop() {
  const canvas = /** @type {HTMLCanvasElement} */ (
    document.getElementById('canvas')
  );
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  renderFace(ctx, state.controller.offscreen, 0, 0);

  Object.values(state.players).forEach((player, i) => {
    // const { x, y, size } = player.position;
    console.log(player)
    renderFace(ctx, state.controller.offscreen, (i + 1) * size, 0);
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
  ctx.arc(posX + r, posY + r, r, 0, 2 * Math.PI);
  ctx.clip();
  ctx.drawImage(imageSource, posX, posY, size, size);
  ctx.restore();
}
