export function map(x, a, b, c, d) {
  const mappedVal = (x - a) * ((d - c) / (b - a)) + c;
  return clamp(mappedVal, c, d);
}

function clamp(x, min, max) {
  return Math.min(Math.max(x, min), max);
}

export class Point {
  constructor(x = 0, y = x) {
    this.x = x;
    this.y = y;
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  scale(scalar) {
    return new Point(this.x * scalar, this.y * scalar);
  }

  normalized() {
    const length = this.length();
    return new Point(this.x / length, this.y / length);
  }
}

export function rafLoop(callback) {
  let raf
  function loop() {
    callback();
    raf = requestAnimationFrame(loop);
  }
  loop();


  return () => {
    cancelAnimationFrame(raf);
  }
}
