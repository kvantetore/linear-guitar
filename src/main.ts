import { createInitialState, createLeapFrogStepper, createWaveOperator, pinnedPositions } from "./propagation";
import { String } from "./string";
import { createRegularGrid } from "./grid";
import { addMath } from "./math";
import { addLinePlot } from "./plotting";
import { pluck } from "./functions";
import { OverdriveNode } from "./effect/OverdriveNode"
import { AudioNodeWrapper } from "./effect/AudioNodeWrapper";
import { ReverbNode } from "./effect/ReverbNode";

//  y(t)
//  y'(t)
//

//  y'(t+dt) = y'(t) + dt y''(t)
//  y(t+dt) = y(t) + dt y'(t+dt)

function plotStandingWave(x, mode: number) {
  let y = x.map(x => Math.sin(mode * x * Math.PI))

  addMath(`f(x) = sin(${mode} \\pi x)`)
  addLinePlot(x, y);

  return y
}


let grid = createRegularGrid(0, 1, 0.01);
// let state = createInitialState(grid, x => Math.exp(- 10 * Math.PI * (x-0.5) * (x-0.5)));
// let state = createInitialState(grid, x => Math.sin(1 * Math.PI * x));

let fretPosition = 0.8;
let pluckPosition = 0.23;
var initialY = pluck(grid, pluckPosition, fretPosition);
// addLinePlot(grid.x, initialY)

// let state = createInitialState(grid, );

// var dt = 1/48000;
let dt = 1 / 48000;
let prop = new String(grid, dt, 82);
// prop.addPlot();



class Guitar {
  grid: IGrid;
  strings: AudioWorkletNode[] = [];
  volumeNode: GainNode;

  plots: any[] = [];
  stringSnapshots: Float32Array[] = [];

  constructor(audioCtx: AudioContext, grid: IGrid) {
    this.grid = grid;
    let frequencyMultiplier = 1;
    this.strings = [
      new AudioWorkletNode(audioCtx, "audio-string", { processorOptions: { dx: grid.dx} }),
      new AudioWorkletNode(audioCtx, "audio-string", { processorOptions: { dx: grid.dx} }),
      new AudioWorkletNode(audioCtx, "audio-string", { processorOptions: { dx: grid.dx} }),
      new AudioWorkletNode(audioCtx, "audio-string", { processorOptions: { dx: grid.dx} }),
      new AudioWorkletNode(audioCtx, "audio-string", { processorOptions: { dx: grid.dx} }),
      new AudioWorkletNode(audioCtx, "audio-string", { processorOptions: { dx: grid.dx} }),
    ];

    this.strings[0].parameters.get("frequency").value =  82.4;
    this.strings[1].parameters.get("frequency").value = 110.0;
    this.strings[2].parameters.get("frequency").value = 146.8;
    this.strings[3].parameters.get("frequency").value = 196.0;
    this.strings[4].parameters.get("frequency").value = 246.9;
    this.strings[5].parameters.get("frequency").value = 329.6;

    this.volumeNode = audioCtx.createGain();

    for (let s of this.strings) {
      s.connect(this.volumeNode);
    }

    this.volumeNode.gain.value = 3

    this.plots = this.strings.map(s => addStringPlot(grid, s));
    this.stringSnapshots = this.strings.map(s => new Float32Array(grid.x.length));

    // update snapshots on event from string nodes
    for (let i = 0; i < this.strings.length; i++) {
      this.strings[i].port.onmessage = (event) => {
        if (event.data.message == "y") {
          this.updateSnapshot(i, event.data.y);
        }
      };
    }
  }

  private updateSnapshot(i: number, snapshot: Float32Array) {
    this.stringSnapshots[i] = snapshot;
  }

  holdFrets(frets: number[]) {
    let time = audioCtx.currentTime;
    for (let i = 0; i < frets.length; i++) {
      let start = this.strings[i].parameters.get("fretPosition").value;
      let end = String.frets[frets[i]]
      // this.strings[i].parameters.get("fretPosition").setValueCurveAtTime([this.strings[i].parameters.get("fretPosition").value, frets[i]], time, 0.1);
      this.strings[i].parameters.get("fretPosition")
        .cancelScheduledValues(time)
        .setValueCurveAtTime([start, end], time, 0.1);
      this.strings[i].parameters.get("dampingCoefficient")
        .cancelScheduledValues(time)
        .setValueAtTime(4, time+0.1)
    }
  }

  releaseFrets() {
    let time = audioCtx.currentTime;
    for (let i = 0; i < this.strings.length; i++) {
      let start = this.strings[i].parameters.get("fretPosition").value;
      let end = 1;
      this.strings[i].parameters.get("fretPosition")
        .cancelScheduledValues(time)
        .setValueCurveAtTime([start, end], time+0.1, 0.1);
      this.strings[i].parameters.get("dampingCoefficient")
        .cancelScheduledValues(time)
        .setValueCurveAtTime([4,100,4], time, 0.2)
    }
  }

  chordStrings: number[] = [0, 1, 2, 3, 4, 5];

  setChordStrings(chordStrings: number[] = [0, 1, 2, 3, 4, 5], delay: number = 0.05) {
    let time = audioCtx.currentTime;
    this.chordStrings = chordStrings;
  }

  pluckChordAtTime(strumStrings: number[], time: number, duration: number) {
    let delay = duration / 6;

    this.strumAtTime(this.strings[strumStrings[0]], time + delay * 0, 0.8);
    this.strumAtTime(this.strings[strumStrings[1]], time + delay * 1, 0.8);
    this.strumAtTime(this.strings[strumStrings[2]], time + delay * 2, 0.8);

    this.strumAtTime(this.strings[strumStrings[strumStrings.length - 1]], time + delay * 3, 0.8);
    this.strumAtTime(this.strings[strumStrings[strumStrings.length - 2]], time + delay * 4, 0.8);
    this.strumAtTime(this.strings[strumStrings[strumStrings.length - 3]], time + delay * 5, 0.8);
  }

  strumDownAtTime(strumStrings: number[], time: number, duration: number) {
    let delay = duration / 6;

    for (let i = 0; i < strumStrings.length; i++) {
      let string = this.strings[strumStrings[i]];
      this.strumAtTime(string, time + i * delay);
    }
  }

  strumUpAtTime(strumStrings: number[], time: number, duration: number) {
    let delay = duration / 6;

    for (let i = 0; i < Math.min(4, strumStrings.length); i++) {
      let string = this.strings[strumStrings[strumStrings.length - i - 1]];
      this.strumAtTime(string, time + i * delay);
    }
  }

  strumAtTime(string: AudioWorkletNode, time: number, force: number = 1, duration: number = 0.01) {
    string.parameters.get("pullForce")
      .setValueCurveAtTime([0, force], time, duration)
      .setValueAtTime(0, time + duration);

    string.parameters.get("dampingCoefficient")
      .setValueAtTime(10, time)
      .setValueAtTime(4, time + duration);
  }


  playNoteAtTime(string: AudioWorkletNode, fret: number, startTime: number, duration: number) {
    string.parameters.get("fretPosition").setValueAtTime(String.frets[fret], startTime);
    this.strumAtTime(string, startTime)
    string.parameters.get("dampingCoefficient").setValueAtTime(100, startTime + duration)
  }

  updatePlots() {
    for (let i = 0; i < this.plots.length; i++) {
      this.plots[i].update(this.stringSnapshots[i]);
    }

    for (let i = 0; i < this.strings.length; i++) {
      this.strings[i].port.postMessage({ message: "requestY" });
    }

  }
}


var audioCtx = new AudioContext();
await audioCtx.audioWorklet.addModule("js/audio-generator.js");
await audioCtx.audioWorklet.addModule("js/audio-string.js");

let guitar = new Guitar(audioCtx, grid);

var overdrive = new OverdriveNode(audioCtx);
var reverb = new ReverbNode(audioCtx);

var guitarNode = new AudioNodeWrapper(audioCtx, guitar.volumeNode);

guitarNode
  .connect(overdrive)
  .connect(reverb)
  .connect(audioCtx.destination);

addButton("Resume", () => {
  audioCtx.resume();
})
addSlider("Guitar Gain", guitar.volumeNode.gain.value, 0, 10, v => guitar.volumeNode.gain.value = v);
addSlider("Overdrive Distortion", overdrive.distortion, 0, 200, (v) => overdrive.distortion = v)
addSlider("Overdrive Gain", overdrive.distortion, 1, 200, (v) => overdrive.gain = v)
addSlider("Overdrive Tone", overdrive.frequency, 1000, 10000, v => {
  overdrive.frequency = v;
  console.log("Freq", v);
});
addSlider("Reverb Level Gain", reverb.levelGain, 0, 1, v => reverb.levelGain = v)
addSlider("Reverb Wet Gain", reverb.wetGain, 0, 1, v => reverb.wetGain = v)

console.log(overdrive.frequency);

let tone = 1.00;
var baseTone = guitar.strings.map(s => s.parameters.get("frequency").value);

// let stringPlots = guitar.strings.map(s => addStringPlot(s));

// guitar.strings[0].parameters.get("frequency").setValueAtTime(2*82, audioCtx.currentTime);

let stepperTime = 0;
let plottingTime = 0;


function addSlider(labelText: string, value: number, min: number, max: number, update: Function) {
  var container = document.createElement("div");

  var input = document.createElement("input");
  input.type = "range";
  input.value = value.toString();
  input.min = min.toString();
  input.max = max.toString();
  input.step = ((max - min) / 200).toString();
  input.style.width = "200px";

  input.addEventListener("input", (ev: InputEvent) => {
    var updatedValue = input.valueAsNumber;
    update(updatedValue);
  })

  var label = document.createElement("label");
  label.textContent = labelText;

  container.append(input);
  container.append(label);
  document.body.append(container);

}


function addStringPlot(grid: IGrid, string: AudioWorkletNode) {
  var y = grid.x.map(x => 0)
  let plot = addLinePlot(grid.x, y, { height: 66 });
  let fretMarker = plot.addMarker(1, 0, "red");
  let pullMarker = plot.addMarker(1, 0, "gray");
  let pickupMarker = plot.addMarker(1, 0, "black");

  for (let fret of String.frets) {
    plot.addVertical(fret, "gray");
  }

  function down(event: MouseEvent) {
    let x = event.offsetX / plot.svg.clientWidth;
    let y = 1 - 2 * event.offsetY / plot.svg.clientHeight;
    let time = audioCtx.currentTime + 0.1;

    if (event.buttons == 1) {

      if (event.ctrlKey) {
        string.parameters.get("fretPosition").setValueAtTime(x, time);
      }
      else {
        string.parameters.get("pullPosition").setValueAtTime(x, time);
        string.parameters.get("pullForce").setValueAtTime(y, time)
        // string.parameters.get("dampingCoefficient").setValueAtTime(100, time)
      }
    }
    else if (event.shiftKey) {
      string.parameters.get("pullPosition").setValueAtTime(x, time);
    }
  }

  function up(event) {
    let time = audioCtx.currentTime + 0.1;
    string.parameters.get("pullForce").setValueAtTime(0, time)
    string.parameters.get("dampingCoefficient").setValueAtTime(4, time)
  }

  plot.svg.addEventListener("mousedown", down.bind(this));
  plot.svg.addEventListener("mousemove", down.bind(this));
  plot.svg.addEventListener("mouseup", up.bind(this));
  plot.svg.addEventListener("mouseleave", up.bind(this));

  return {
    string: string,
    plot: plot,

    update: (y) => {
      plot.update(grid.x, y);
      fretMarker.update(string.parameters.get("fretPosition").value, 0, "red");
      pullMarker.update(string.parameters.get("pullPosition").value, 0, "gray");
      pickupMarker.update(string.parameters.get("pickupPosition").value, 0, "black");
    }
  }
}

function addButton(label: string, handler: () => void) {
  var btn = document.createElement("button");
  btn.innerText = label;
  btn.addEventListener("click", handler);

  document.body.append(btn);
}

function animatePlot() {
  guitar.updatePlots();

  // setTimeout(() => {
  requestAnimationFrame(animatePlot);
  // }, 1000/25)
}

requestAnimationFrame(animatePlot);




addButton("Strum", () => {
  guitar.strumDownAtTime([0, 1, 2, 3, 4, 5], audioCtx.currentTime, 0.1);
  // prop.pullPosition = pluckPosition;
  // prop.pullForce = 1;
  // setTimeout(() => {
  //   prop.pullPosition = null;
  // }, 20);
  // prop.state.y = pluck(grid, pluckPosition, fretPosition);
})

var s0 = guitar.strings[0];
var s1 = guitar.strings[1];
var s2 = guitar.strings[2];
var s3 = guitar.strings[3];
var s4 = guitar.strings[4];
var s5 = guitar.strings[5];

let bpm = 122;
let eighthDuration = 60 / bpm / 2;
let measureDuration = 8 * eighthDuration;

function note(v: number[], measure: number, eighth: number, duration: number) {
  let time = audioCtx.currentTime;
  for (let s in v) {
    if (v[s] != null) {
      console.log(s, v[s])
      guitar.playNoteAtTime(guitar.strings[s], v[s], time + measure * measureDuration + eighth * eighthDuration, duration)
    }
  }
}

function playEighth(v: number[], measure: number, eighth: number) {
  note(v, measure, eighth, eighthDuration)
}

function playQuarter(v: number[], measure: number, eighth: number) {
  note(v, measure, eighth, eighthDuration)
}

addButton("Smoke on the water", () => {
  var time = audioCtx.currentTime + 0.5;

  let _ = null;

  note([_, 5, 5, _, _, _], 0, 0, 1 * eighthDuration);
  note([_, _, 3, 3, _, _], 0, 2, 1 * eighthDuration);
  note([_, _, 5, 5, _, _], 0, 4, 2 * eighthDuration);
  note([_, 5, 5, _, _, _], 0, 7, 1 * eighthDuration);

  note([_, _, 3, 3, _, _], 1, 1, 1 * eighthDuration);
  note([_, _, 6, 6, _, _], 1, 3, 1 * eighthDuration);
  note([_, _, 5, 5, _, _], 1, 4, 2 * eighthDuration);

  note([_, 5, 5, _, _, _], 2, 0, 1 * eighthDuration);
  note([_, _, 3, 3, _, _], 2, 2, 1 * eighthDuration);
  note([_, _, 5, 5, _, _], 2, 4, 2 * eighthDuration);
  note([_, _, 3, 3, _, _], 2, 7, 1 * eighthDuration);

  note([_, 5, 5, _, _, _], 3, 1, 3 * eighthDuration);

});

addButton("Sweet child of mine", () => {
  let _ = null;
  playEighth([_, _, 12, _, _, _], 0, 0);
  playEighth([_, _, _, _, 15, _], 0, 1);
  playEighth([_, _, _, 14, _, _], 0, 2);
  playEighth([_, _, _, 12, _, _], 0, 3);
  playEighth([_, _, _, _, _, 15], 0, 4);
  playEighth([_, _, _, 14, _, _], 0, 5);
  playEighth([_, _, _, _, _, 14], 0, 6);
  playEighth([_, _, _, 14, _, _], 0, 7);

  playEighth([_, _, 12, _, _, _], 1, 0);
  playEighth([_, _, _, _, 15, _], 1, 1);
  playEighth([_, _, _, 14, _, _], 1, 2);
  playEighth([_, _, _, 12, _, _], 1, 3);
  playEighth([_, _, _, _, _, 15], 1, 4);
  playEighth([_, _, _, 14, _, _], 1, 5);
  playEighth([_, _, _, _, _, 14], 1, 6);
  playEighth([_, _, _, 14, _, _], 1, 7);

  playEighth([_, _, 14, _, _, _], 2, 0);
  playEighth([_, _, _, _, 15, _], 2, 1);
  playEighth([_, _, _, 14, _, _], 2, 2);
  playEighth([_, _, _, 12, _, _], 2, 3);
  playEighth([_, _, _, _, _, 15], 2, 4);
  playEighth([_, _, _, 14, _, _], 2, 5);
  playEighth([_, _, _, _, _, 14], 2, 6);
  playEighth([_, _, _, 14, _, _], 2, 7);

  playEighth([_, _, 14, _, _, _], 3, 0);
  playEighth([_, _, _, _, 15, _], 3, 1);
  playEighth([_, _, _, 14, _, _], 3, 2);
  playEighth([_, _, _, 12, _, _], 3, 3);
  playEighth([_, _, _, _, _, 15], 3, 4);
  playEighth([_, _, _, 14, _, _], 3, 5);
  playEighth([_, _, _, _, _, 14], 3, 6);
  playEighth([_, _, _, 14, _, _], 3, 7);

})

let strummingPattern: ("None" | "DownOnEights" | "UpAndDown" | "Pluck") = "None"

setInterval(() => {
  if (strummingPattern == "DownOnEights") {
    guitar.strumDownAtTime(guitar.chordStrings, audioCtx.currentTime + 0 * eighthDuration, eighthDuration / 8);
    guitar.strumDownAtTime(guitar.chordStrings, audioCtx.currentTime + 2 * eighthDuration, eighthDuration / 8);
    guitar.strumDownAtTime(guitar.chordStrings, audioCtx.currentTime + 4 * eighthDuration, eighthDuration / 8);
    guitar.strumDownAtTime(guitar.chordStrings, audioCtx.currentTime + 6 * eighthDuration, eighthDuration / 8);
  }
  else if (strummingPattern == "UpAndDown") {
    guitar.strumDownAtTime(guitar.chordStrings, audioCtx.currentTime + 0 * eighthDuration, eighthDuration / 8);
    guitar.strumDownAtTime(guitar.chordStrings, audioCtx.currentTime + 2 * eighthDuration, eighthDuration / 8);
    guitar.strumUpAtTime(guitar.chordStrings, audioCtx.currentTime + 3 * eighthDuration, eighthDuration / 8);
    guitar.strumDownAtTime(guitar.chordStrings, audioCtx.currentTime + 4 * eighthDuration, eighthDuration / 8);
    guitar.strumDownAtTime(guitar.chordStrings, audioCtx.currentTime + 6 * eighthDuration, eighthDuration / 8);
    guitar.strumUpAtTime(guitar.chordStrings, audioCtx.currentTime + 7 * eighthDuration, eighthDuration / 8);
  }
  else if (strummingPattern == "Pluck") {
    guitar.pluckChordAtTime(guitar.chordStrings, audioCtx.currentTime, eighthDuration * 8);

  }
}, eighthDuration * 8 * 1000);


let holdingChord: string = null;

document.body.addEventListener("keypress", (event) => {
  if (event.key != null && event.key === holdingChord) {
    return;
  }

  console.log("key", event.key, event.ctrlKey, event.code);
  var unhandled = false;
  if (event.code == "Escape") {
    strummingPattern = "None";
  }
  else if (event.code == "Digit1") {
    strummingPattern = "DownOnEights";
  }
  else if (event.code == "Digit2") {
    strummingPattern = "UpAndDown";
  }
  else if (event.code == "Digit3") {
    strummingPattern = "Pluck";
  }
  else if (event.code == "Digit4") {
  }
  else if (event.code == "Digit5") {
  }
  else if (event.code == "Digit6") {
  }
  else if (event.code == "Digit7") {
    guitar.pluckChordAtTime(guitar.chordStrings, audioCtx.currentTime, 1.5);
  }
  else if (event.code == "Digit9") {
    guitar.strumDownAtTime(guitar.chordStrings, audioCtx.currentTime, 0.2);
  }
  else if (event.code == "Digit8") {
    guitar.strumDownAtTime(guitar.chordStrings, audioCtx.currentTime + 0 * eighthDuration, eighthDuration / 8);
    guitar.strumDownAtTime(guitar.chordStrings, audioCtx.currentTime + 2 * eighthDuration, eighthDuration / 8);
    guitar.strumUpAtTime(guitar.chordStrings, audioCtx.currentTime + 3 * eighthDuration, eighthDuration / 8);
    guitar.strumDownAtTime(guitar.chordStrings, audioCtx.currentTime + 4 * eighthDuration, eighthDuration / 8);
    guitar.strumDownAtTime(guitar.chordStrings, audioCtx.currentTime + 6 * eighthDuration, eighthDuration / 8);
    guitar.strumUpAtTime(guitar.chordStrings, audioCtx.currentTime + 7 * eighthDuration, eighthDuration / 8);
    // guitar.strumUpAtTime(guitar.chordStrings, audioCtx.currentTime + eighthDuration, eighthDuration/8);
  }
  else if (event.key == " ") {
    guitar.strumDownAtTime(guitar.chordStrings, audioCtx.currentTime, 1.5);
  }
  else if (event.key == "e") {
    guitar.holdFrets([0, 2, 2, 1, 0, 0]);
    guitar.setChordStrings();
    holdingChord = event.key;
  }
  else if (event.key == "E") {
    guitar.holdFrets([0, 2, 2, 0, 0, 0])
    guitar.setChordStrings([0, 1, 2, 3, 4, 5]);
    holdingChord = event.key;
  }

  else if (event.key == "a") {
    guitar.holdFrets([0, 0, 2, 2, 2, 0]);
    guitar.setChordStrings([1, 2, 3, 4, 5]);
    holdingChord = event.key;
  }
  else if (event.key == "A") {
    guitar.holdFrets([0, 0, 2, 2, 1, 0])
    guitar.setChordStrings([1, 2, 3, 4, 5]);
    holdingChord = event.key;
  }
  else if (event.key == "d") {
    guitar.holdFrets([0, 0, 0, 2, 3, 2]);
    guitar.setChordStrings([2, 3, 4, 5]);
    holdingChord = event.key;
  }

  else if (event.key == "g") {
    if (event.ctrlKey) {
      guitar.holdFrets([3, 2, 0, 0, 0, 1])
      guitar.setChordStrings([0, 1, 2, 3, 4, 5])
      holdingChord = event.key;
    }
    else {
      guitar.holdFrets([3, 2, 0, 0, 0, 3])
      guitar.setChordStrings();
      holdingChord = event.key;
    }
  }
  else if (event.key == "c") {
    guitar.holdFrets([0, 3, 2, 0, 1, 0])
    guitar.setChordStrings([1, 2, 3, 4, 5]);
    holdingChord = event.key;
  }

  else if (event.key == "f") {
    guitar.holdFrets([0, 0, 3, 2, 1, 1]);
    guitar.setChordStrings([2, 3, 4, 5]);
    holdingChord = event.key;
  }

  else if (event.key == "b") {
    if (event.ctrlKey) {
      guitar.holdFrets([0, 2, 1, 2, 0, 2])
      guitar.setChordStrings([1, 2, 3, 4, 5])
      holdingChord = event.key;
    }
    else {
      guitar.holdFrets([0, 2, 4, 4, 3, 0])
      guitar.setChordStrings([1, 2, 3, 4])
      holdingChord = event.key;
    }
  }

  else if (event.key == "D") {
    guitar.holdFrets([0, 0, 0, 2, 3, 1])
    guitar.setChordStrings([1, 2, 3, 4, 5])
    holdingChord = event.key;
  }

  else {
    unhandled = true;
  }

  if (!unhandled) {
    event.preventDefault();
  }

});

document.body.addEventListener("keyup", event => {
  if (event.key != null && event.key == holdingChord) {
    holdingChord = null;
    guitar.releaseFrets();
  }
})

addButton("E", () => {
  guitar.holdFrets([0, 2, 2, 1, 0, 0]);
  guitar.setChordStrings();
})

addButton("A", () => {
  guitar.holdFrets([0, 0, 2, 2, 2, 0]);
  guitar.setChordStrings([1, 2, 3, 4, 5]);
})

addButton("D", () => {
  guitar.holdFrets([0, 0, 0, 2, 3, 2]);
  guitar.setChordStrings([2, 3, 4, 5]);
})

addButton("C", () => {
  guitar.holdFrets([0, 3, 2, 0, 1, 0]);
  guitar.setChordStrings([1, 2, 3, 4, 5]);
});

addButton("F", () => {
  guitar.holdFrets([0, 0, 3, 2, 1, 1]);
  guitar.setChordStrings([2, 3, 4, 5]);




});


addButton("G", () => {
  guitar.holdFrets([3, 2, 0, 0, 0, 3]);
  guitar.setChordStrings();
})

addButton("Am", () => {
  guitar.holdFrets([0, 0, 2, 2, 1, 0]);
  guitar.setChordStrings([1, 2, 3, 4, 5]);
});

addButton("Em", () => {
  guitar.holdFrets([0, 2, 2, 0, 0, 0]);
  guitar.setChordStrings([0, 1, 2, 3, 4, 5]);
});
