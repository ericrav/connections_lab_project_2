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
    // const dims = faceapi.matchDimensions(state.controller.offscreen, videoEl);
    // result = faceapi.resizeResults(result, {});
    state.controller.updateBoundingBox(result.detection.box);

    const facePath = result.landmarks.getJawOutline();
    // state.controller.facePath = facePath.map((p) => ({
    //   x: p.x / dims.width,
    //   y: p.y / dims.height,
    // }));

    const mouth = result.landmarks.getMouth();
    const nose = result.landmarks.getNose();
    const noseCenter = nose
      .reduce((acc, curr) => curr.add(acc))
      .div(new faceapi.Point(mouth.length, mouth.length));

    state.controller.nosePoint = new Point(1 - (noseCenter.x / 280), noseCenter.y / 200);

    const videoMidPoint = new faceapi.Point(
      result.landmarks.imageWidth,
      result.landmarks.imageHeight
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

    const speed = map(openness, 1, 30, 0, 3);

    state.controller.avatar.addVelocity(movement.scale(speed));
  }
}

function isFaceDetectionModelLoaded() {
  return !!model.params;
}
