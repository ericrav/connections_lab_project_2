import * as Tone from 'tone';

export function playNote() {
  Tone.start();
  const vol = new Tone.Volume(-18).toDestination();
  const synth = new Tone.Synth().connect(vol);

  let freq = 20;
  let volume = -18;
  synth.triggerAttack(freq);
  synth.volume.value = volume;

  window.addEventListener('mousemove', (e) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;

    freq = x * 1000;
    volume = y * -25;
  });

  setInterval(() => {
    synth.setNote(freq);
    synth.volume.value = volume;
    if (volume <= -18) {
      vol.mute = true;
    } else {
      vol.mute = false;
    }
  }, 0);
}
