import * as faceapi from 'face-api.js';
import { state } from './state';
import { map } from './utils';
const model = faceapi.nets.tinyFaceDetector;

export async function initFaceTracking(videoEl) {
  await faceapi.loadFaceLandmarkModel('/models');
  await model.load('/models');

  const canvas = document.getElementById('canvas');
  canvas.width = videoEl.width;

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
    state.box = resizedResult.detection.box;

    const mouth = resizedResult.landmarks.getMouth();
    const mouthCenter = mouth.reduce((acc, curr) => curr.add(acc)).div(new faceapi.Point(mouth.length, mouth.length));

    const mouthTop = mouth[14];
    const mouthBottom = mouth[18];
    const openness = mouthTop.sub(mouthBottom).abs().magnitude();

    state.position.x = mouthCenter.x / dims.width;
    state.position.y = mouthCenter.y / dims.height;
    state.position.size = map(openness, 1, 30, 0, 2);
  }
}


function isFaceDetectionModelLoaded() {
  return !!model.params;
}
