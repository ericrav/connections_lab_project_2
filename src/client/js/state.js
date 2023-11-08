export class Controller {
  boundingBox = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };

  facePath = [];

  updateBoundingBox(boundingBox) {
    const factor = 0.4;
    this.boundingBox.x += (boundingBox.x - this.boundingBox.x) * factor;
    this.boundingBox.y += (boundingBox.y - this.boundingBox.y) * factor;
    this.boundingBox.width +=
      (boundingBox.width - this.boundingBox.width) * factor;
    this.boundingBox.height +=
      (boundingBox.height - this.boundingBox.height) * factor;
  }

  offscreen = (() => {
    const offscreen = document.createElement('canvas');
    offscreen.width = 256;
    offscreen.height = 256;
    return offscreen;
  })();
}

export const state = {
  position: {
    x: 0,
    y: 0,
    size: 0,
  },
  controller: new Controller(),
};
