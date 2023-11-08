import * as faceapi from 'face-api.js';
import { state } from './state';
import { map } from './utils';
const model = faceapi.nets.tinyFaceDetector;

export async function initFaceTracking() {
  const videoEl = await setupWebcam();
  await faceapi.loadFaceLandmarkModel('/models');
  await model.load('/models');

  const canvas = document.getElementById('canvas');

  const loop = async () => {
    await detectFace(videoEl, canvas);
    renderFaceInBoundingBox(videoEl);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

function renderFaceInBoundingBox(videoEl) {
  const offscreen = state.controller.offscreen;
  const ctx = offscreen.getContext('2d');

  const { x, y, width, height } = state.controller.boundingBox;
  ctx.drawImage(videoEl, x, y, width, height, 0, 0, 256, 256 * (height / width));
}


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

function getFaceDetectorOptions() {
  const inputSize = 512;
  const scoreThreshold = 0.5;
  return new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold });
}

async function detectFace(videoEl, canvas) {
  if (videoEl.paused || videoEl.ended || !isFaceDetectionModelLoaded()) {
    return;
  }

  const options = getFaceDetectorOptions();

  const result = await faceapi
    .detectSingleFace(videoEl, options)
    .withFaceLandmarks();

  if (result) {
    // const dims = faceapi.matchDimensions(canvas, videoEl, true);
    const resizedResult = result //faceapi.resizeResults(result, dims);
    faceapi.draw.drawFaceLandmarks(canvas, resizedResult);
    state.controller.updateBoundingBox(resizedResult.detection.box);

    const facePath = resizedResult.landmarks.getJawOutline();
    // state.controller.facePath = facePath.map((p) => ({
    //   x: p.x / dims.width,
    //   y: p.y / dims.height,
    // }));

    const mouth = resizedResult.landmarks.getMouth();
    const mouthCenter = mouth.reduce((acc, curr) => curr.add(acc)).div(new faceapi.Point(mouth.length, mouth.length));

    const mouthTop = mouth[14];
    const mouthBottom = mouth[18];
    const openness = mouthTop.sub(mouthBottom).abs().magnitude();

    // state.position.x = mouthCenter.x / dims.width;
    // state.position.y = mouthCenter.y / dims.height;
    state.position.size = map(openness, 1, 30, 0, 2);
  }
}


function isFaceDetectionModelLoaded() {
  return !!model.params;
}
