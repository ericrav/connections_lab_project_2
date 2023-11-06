import * as faceapi from 'face-api.js';
import { state } from './state';
const model = faceapi.nets.tinyFaceDetector;

export async function initFaceTracking(videoEl) {
  await faceapi.loadFaceLandmarkModel('/models');
  await model.load('/models');

  const canvas = document.getElementById('canvas');

  const loop = async () => {
    await detectFace(videoEl, canvas);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
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
    const dims = faceapi.matchDimensions(canvas, videoEl, true);
    const resizedResult = faceapi.resizeResults(result, dims);
    faceapi.draw.drawFaceLandmarks(canvas, resizedResult);

    const mouth = resizedResult.landmarks.getMouth();
    const mouthCenter = mouth.reduce((acc, curr) => curr.add(acc)).div(new faceapi.Point(mouth.length, mouth.length));

    const mouthTop = mouth[3];
    const mouthBottom = mouth[9];
    const openness = mouthTop.sub(mouthBottom).abs().magnitude() / mouthCenter.magnitude() / 0.1;

    state.position.x = mouthCenter.x / dims.width;
    state.position.y = mouthCenter.y / dims.height;
    state.position.size = openness < 0.25 ? 0 : openness;
  }
}

function isFaceDetectionModelLoaded() {
  return !!model.params;
}
