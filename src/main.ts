import { createInitialState, createLeapFrogStepper, createWaveOperator, pinnedPositions } from "./propagation";
import { String } from "./string";
import { createRegularGrid } from "./grid";
import { addMath } from "./math";
import { addLinePlot } from "./plotting";
import { pluck } from "./functions";

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


var audioCtx = new AudioContext();
await audioCtx.audioWorklet.addModule("js/audio-generator.js");
await audioCtx.audioWorklet.addModule("js/audio-string.js");

class Guitar {
  grid: IGrid;
  strings: AudioWorkletNode[] = [];
  plots: any[] = [];
  ys: Float32Array[] = [];

  constructor(grid: IGrid) {
    this.grid = grid;
    this.strings = [
      new AudioWorkletNode(audioCtx, "audio-string", { processorOptions: { dx: grid.dx, requency: 82 }}),
      new AudioWorkletNode(audioCtx, "audio-string", { processorOptions: { dx: grid.dx, frequency: 110, } }),
      new AudioWorkletNode(audioCtx, "audio-string", { processorOptions: { dx: grid.dx, frequency: 147, } }),
      new AudioWorkletNode(audioCtx, "audio-string", { processorOptions: { dx: grid.dx, frequency: 196, } }),
      new AudioWorkletNode(audioCtx, "audio-string", { processorOptions: { dx: grid.dx, frequency: 247, } }),
      new AudioWorkletNode(audioCtx, "audio-string", { processorOptions: { dx: grid.dx, frequency: 330, } }),
    ];

    for (let s of this.strings) {
      s.connect(audioCtx.destination);
    }

    this.plots = this.strings.map(s => addStringPlot(grid, s));
    this.ys = this.strings.map(s => new Float32Array(grid.x.length));

    for (let i = 0; i < this.strings.length; i++) {
      this.strings[i].port.onmessage = (event) => { 
        if (event.data.message == "y") {
          this.ys[i] = event.data.y;
        }
      };
    }
  }

  holdFrets(frets: number[]) {
    let time = audioCtx.currentTime;
    for (let i = 0; i < frets.length; i++) {
      this.strings[i].parameters.get("fretPosition").linearRampToValueAtTime(String.frets[frets[i]], time+0.1);
    }
  }

  strum(strings: number[] = [0, 1, 2, 3, 4, 5], delay: number = 0.05) {
    let time = audioCtx.currentTime ;

    // for (let i = 0; i<strings.length; i++) {
    //    this.strumAtTime(this.strings[strings[i]], time + delay * i);
    // }

    delay = 0.25;

    this.strumAtTime(this.strings[strings[0]], time + delay * 0, 2);
    this.strumAtTime(this.strings[strings[1]], time + delay * 1, 0.8);
    this.strumAtTime(this.strings[strings[2]], time + delay * 2, 0.8);

    this.strumAtTime(this.strings[strings[strings.length-1]], time + delay * 3, 1.2);
    this.strumAtTime(this.strings[strings[strings.length-2]], time + delay * 4, 0.8);
    this.strumAtTime(this.strings[strings[strings.length-3]], time + delay * 5, 0.8);

  }

  strumAtTime(string: AudioWorkletNode, time: number, force: number = 1)
  {
      string.parameters.get("pullPosition")
        .setValueAtTime(0.10, time);
      string.parameters.get("pullForce")
        // .setValueAtTime(0, time)
        // .cancelAndHoldAtTime(time)
        .setValueCurveAtTime([0, force], time, 0.01)
        // .setValueAtTime(1, time )
        .setValueAtTime(0, time + 0.01);

      string.parameters.get("dampingCoefficient")
        // .setValueAtTime(100, time)
        .setValueAtTime(4, time + 0.01);
  }

  playNoteAtTime(string: AudioWorkletNode, fret: number, startTime: number, duration: number)
  {
    string.parameters.get("fretPosition").setValueAtTime(String.frets[fret], startTime);
    this.strumAtTime(string, startTime)
    string.parameters.get("dampingCoefficient").setValueAtTime(12, startTime + duration)
  }

  updatePlots() {
    for (let i = 0; i < this.plots.length; i++) {
      this.plots[i].update(this.ys[i]);
    }

    for (let i = 0; i < this.strings.length; i++) {
      this.strings[i].port.postMessage({message: "requestY"});
    }

  }
}

let guitar = new Guitar(grid);

// let stringPlots = guitar.strings.map(s => addStringPlot(s));

let stepperTime = 0;
let plottingTime = 0;

function addStringPlot(grid: IGrid, string: AudioWorkletNode) {
  var y = grid.x.map(x => 0)
  let plot = addLinePlot(grid.x, y, { height: 65 });
  let fretMarker = plot.addMarker(1, 0, "red");

  for (let fret of String.frets) {
      plot.addVertical(fret, "gray");
  }

  function down(event) {
      let time = audioCtx.currentTime + 0.1;

      if (event.buttons == 1) {
          let x = event.offsetX / plot.svg.clientWidth;
          let y = 1 - 2 * event.offsetY / plot.svg.clientHeight;

          if (event.ctrlKey) {
            string.parameters.get("fretPosition").setValueAtTime(x, time);
          }
          else {
            string.parameters.get("pullPosition").setValueAtTime(x, time);
            string.parameters.get("pullForce").setValueAtTime(y, time)
            // string.parameters.get("dampingCoefficient").setValueAtTime(100, time)
          }
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
  guitar.strum();
  // prop.pullPosition = pluckPosition;
  // prop.pullForce = 1;
  // setTimeout(() => {
  //   prop.pullPosition = null;
  // }, 20);
  // prop.state.y = pluck(grid, pluckPosition, fretPosition);
})

addButton("Smoke on the water", () => {
  var time = audioCtx.currentTime + 0.5;

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
    for (let s in v) {
      if (v[s] != null)
      {
        guitar.playNoteAtTime(guitar.strings[s], v[s], time + measure * measureDuration + eighth * eighthDuration, duration)
      }
    }
  }

  function playEighth(v: number[], measure: number, eighth: number)
  {
    note(v, measure, eighth, eighthDuration)
  }

  function playQuarter(v: number[], measure: number, eighth: number)
  {
    note(v, measure, eighth, eighthDuration)
  }

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

document.body.addEventListener("keydown", (event) => {
  if (event.key == " ") {
    guitar.strum();
  }
  else if (event.key == "e") {
    guitar.holdFrets([0, 2, 2, 1, 0, 0]);
    guitar.strum();  
  }
  else if (event.key == "a") {
    guitar.holdFrets([0, 0, 2, 2, 2, 0]);
    guitar.strum([1,2,3,4,5]); 
  }
  else if (event.key == "A"){
    guitar.holdFrets([0, 0, 2, 2, 1 ,0])
    guitar.strum([1,2,3,4,5]);
  }
  else if (event.key == "d") {
    guitar.holdFrets([0, 0, 0, 2, 3, 2]);
    guitar.strum([2,3,4,5]); 
  }

  else if (event.key == "g"){
    guitar.holdFrets([3,2,0,0,0,3])
    guitar.strum(); 
  }
  else if (event.key == "c"){
    guitar.holdFrets([0,3,2,0,1,0]) 
    guitar.strum([1,2,3,4,5]); 
  }
  else if (event.key =="z"){
    guitar.holdFrets([0,0,2,2,1,0])
    guitar.strum([1,2,3,4,5]);   
  }

  else if (event.key == "f"){
    guitar.holdFrets([0, 0, 3, 2, 1, 1]);
    guitar.strum([2,3,4,5]);
  }



});

addButton("E", () => {
  guitar.holdFrets([0, 2, 2, 1, 0, 0]);
  guitar.strum();
})

addButton("A", () => {
  guitar.holdFrets([0, 0, 2, 2, 2, 0]);
  guitar.strum([1,2,3,4,5]);
})

addButton("D", () => {
  guitar.holdFrets([0, 0, 0, 2, 3, 2]);
  guitar.strum([2,3,4,5]);
})

addButton("C", () => {
  guitar.holdFrets([0, 3, 2, 0, 1, 0]);
  guitar.strum([1,2,3,4,5]);
});

addButton("F", () => {
  guitar.holdFrets([0, 0, 3, 2, 1, 1]);
  guitar.strum([2,3,4,5]);
});


addButton("G", () => {
  guitar.holdFrets([3, 2, 0, 0, 0, 3]);
  guitar.strum();
})

addButton("Am", () => {
  guitar.holdFrets([0, 0, 2, 2, 1, 0]);
  guitar.strum([1,2,3,4,5]);
});

addButton("Em", () => {
  guitar.holdFrets([0, 2, 2, 0, 0, 0]);
  guitar.strum([0,1,2,3,4,5]);
});
