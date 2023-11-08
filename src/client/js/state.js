// @ts-check

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

export class Player {
  /**
   * @param {string} socketId
   * @param {import("simple-peer").Instance} simplePeer
   */
  constructor(socketId, simplePeer) {
    this.socketId = socketId;
    this.simplePeer = simplePeer;
  }

  addMediaStream(mediaStream) {
    const videoEl = document.createElement('video');
    videoEl.id = this.socketId;
    videoEl.srcObject = mediaStream;
    videoEl.muted = true;
    videoEl.playsInline = true;
    videoEl.autoplay = true;
    videoEl.onloadedmetadata = (e) => {
      videoEl.play();
    };
    //attach to html
    document.body.appendChild(videoEl);
    this.videoEl = videoEl;
  }

  dispose() {
    if (this.simplePeer) {
      this.simplePeer.destroy();
    }

    if (this.videoEl) {
      this.videoEl.remove();
    }
  }
}

export const state = {
  position: {
    x: 0,
    y: 0,
    size: 0,
  },
  controller: new Controller(),
  players: /** @type {Record<String, Player>} */({}),
};

export function addPlayer(id, player) {
  state.players[id] = player;
}

export function removePlayer(id) {
  state.players[id].dispose();
  delete state.players[id];
}
