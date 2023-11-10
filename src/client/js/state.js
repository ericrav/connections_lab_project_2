// @ts-check

import { Point } from './utils';

export const MAX_X = 1200;
export const MAX_Y = 800;

const PLAYER_SIZE = 128;

export class Avatar {
  position = new Point(MAX_X / 2, MAX_Y / 2);
  velocity = new Point();

  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    const offset = PLAYER_SIZE / 2;

    if (this.position.x < offset) {
      this.position.x = offset;
      this.velocity.x *= -1;
    }
    if (this.position.x > MAX_X - offset) {
      this.position.x = MAX_X - offset;
      this.velocity.x *= -1;
    }
    if (this.position.y < offset) {
      this.position.y = offset;
      this.velocity.y *= -1;
    }
    if (this.position.y > MAX_Y - offset) {
      this.position.y = MAX_Y - offset;
      this.velocity.y *= -1;
    }
  }

  addVelocity(acceleration) {
    const friction = 0.1;
    this.velocity.x += acceleration.x - this.velocity.x * friction;
    this.velocity.y += acceleration.y - this.velocity.y * friction;

    const maxSpeed = 9;
    if (this.velocity.length() > maxSpeed) {
      this.velocity = this.velocity.normalized().scale(maxSpeed);
    }
  }
}

export class Controller {
  boundingBox = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };

  nosePoint = new Point();

  facePath = [];

  avatar = new Avatar();

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
  avatar = new Avatar();

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
  controller: new Controller(),
  players: /** @type {Record<String, Player>} */ ({}),
};

export function addPlayer(id, player) {
  state.players[id] = player;
}

export function removePlayer(id) {
  state.players[id].dispose();
  delete state.players[id];
}
