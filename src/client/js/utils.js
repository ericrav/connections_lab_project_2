export function map(x, a, b, c, d) {
  const mappedVal = (x - a) * ((d - c) / (b - a)) + c;
  return clamp(mappedVal, c, d);
}

function clamp(x, min, max) {
  return Math.min(Math.max(x, min), max);
}
