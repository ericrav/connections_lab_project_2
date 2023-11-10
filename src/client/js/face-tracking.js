// @ts-check

import * as faceapi from 'face-api.js';
import { state } from './state';
import { Point, map } from './utils';
const model = faceapi.nets.tinyFaceDetector;

export async function initFaceTracking() {
  const videoEl = await setupWebcam();
  await faceapi.loadFaceLandmarkModel('/models');
  await model.load('/models');

  const canvas = document.getElementById('canvas');

  const loop = async () => {
    await detectFace(videoEl);
    renderFaceInBoundingBox(videoEl);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

function renderFaceInBoundingBox(videoEl) {
  const offscreen = state.controller.offscreen;
  const ctx = offscreen.getContext('2d');

  const { x, y, width, height } = state.controller.boundingBox;

  ctx.save();
  ctx.scale(-1, 1);
  ctx.drawImage(
    videoEl,
    x,
    y,
    width,
    height,
    0,
    0,
    -256,
    256 * (height / width)
  );

  ctx.restore();
}

async function setupWebcam() {
  const videoEl = /** @type {HTMLVideoElement} */ (
    document.getElementById('webcam')
  );

  const stream = await navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .catch((err) => {
      console.error(err);
      alert('To play, please enable camera access in your browser settings');
    });

  if (!stream) return;
  videoEl.srcObject = stream;

  return videoEl;
}

function getFaceDetectorOptions() {
  const inputSize = 512;
  const scoreThreshold = 0.5;
  return new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold });
}

/**
 * @param {HTMLVideoElement} videoEl
 */
async function detectFace(videoEl) {
  if (videoEl.paused || videoEl.ended || !isFaceDetectionModelLoaded()) {
    return;
  }

  const options = getFaceDetectorOptions();

  let result = await faceapi
    .detectSingleFace(videoEl, options)
    .withFaceLandmarks();

  if (result) {
    // before resizing
    state.controller.updateBoundingBox(result.detection.box);

    result = faceapi.resizeResults(result, {
      width: 480,
      height: 480 / videoEl.videoWidth * videoEl.videoHeight,
    });

    state.result = result;

    // const facePath = result.landmarks.getJawOutline();
    // state.controller.facePath = facePath.map((p) => ({
    //   x: p.x / dims.width,
    //   y: p.y / dims.height,
    // }));

    const mouth = result.landmarks.getMouth();
    const nose = result.landmarks.getNose();
    const noseCenter = nose[3];
    state.controller.nosePoint = new Point(noseCenter.x, noseCenter.y);

    const videoMidPoint = new faceapi.Point(
      480/2,
      480 / videoEl.videoWidth * videoEl.videoHeight / 2,
    );

    const aspect = result.landmarks.imageWidth / result.landmarks.imageHeight;
    const joystickVector = noseCenter.sub(videoMidPoint).mul(new faceapi.Point(-1, aspect*2));

    const minimumMagnitude = result.landmarks.imageWidth / 4;

    const movement =
      joystickVector.magnitude() > minimumMagnitude
        ? new Point(joystickVector.x, joystickVector.y).normalized()
        : new Point(0);

    const mouthTop = mouth[14];
    const mouthBottom = mouth[18];
    const openness = mouthTop.sub(mouthBottom).abs().magnitude();
    const speed =
      (map(openness, 1, 30, 0, 3) + (joystickVector.magnitude() > minimumMagnitude ? 0.5 : 0)) * result.detection.score;

    const left = document.getElementById('left');
    left.style.transform = `scale(${movement.x < 0 ? speed + -movement.x : 0.5})`;
    const right = document.getElementById('right');
    right.style.transform = `scale(${movement.x > 0 ? speed + movement.x : 0.5})`;
    const up = document.getElementById('up');
    up.style.transform = `scale(${movement.y < 0 ? speed + -movement.y : 0.5})`;
    const down = document.getElementById('down');
    down.style.transform = `scale(${movement.y > 0 ? speed + movement.y : 0.5})`;

    state.controller.avatar.addVelocity(movement.scale(speed));
  }
}

function isFaceDetectionModelLoaded() {
  return !!model.params;
}
