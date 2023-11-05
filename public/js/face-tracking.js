const faceapi = window.faceapi;
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
  }
}

function isFaceDetectionModelLoaded() {
  return !!model.params;
}
