// import * as Tone from 'http://unpkg.com/tone/build/esm/index.js';


export function playNote() {
  const synth = new Tone.Synth().toDestination();

  synth.triggerAttackRelease("C4", "8n");
}
