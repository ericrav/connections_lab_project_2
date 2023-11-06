import * as Tone from 'tone';
import { state } from './state';

export function playNote() {
  Tone.start();
  const vol = new Tone.Volume(-18).toDestination();
  const synth = new Tone.Synth().connect(vol);

  let freq = 20;
  let volume = -18;
  synth.triggerAttack(freq);
  synth.volume.value = volume;

  setInterval(() => {
    freq = state.position.x * 1500 + 110;
    volume = (1 - state.position.size) * -25;
    synth.setNote(freq);
    synth.volume.value = volume;
    if (volume <= -18) {
      vol.mute = true;
    } else {
      vol.mute = false;
    }
  }, 0);
}
