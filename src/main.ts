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

class Guitar {
  grid: IGrid;
  strings: String[] = [];
  frets: number[];
  t: number;

  constructor(grid: IGrid) {
    this.grid = grid;
    this.strings = [
      new String(grid, dt, 82),
      new String(grid, dt, 110),
      new String(grid, dt, 147),
      new String(grid, dt, 196),
      new String(grid, dt, 247),
      new String(grid, dt, 330),
    ]

    this.t = 0;
  }

  step() {
    this.strings.forEach(s => s.step());
    this.t += dt;
  }

  sample(steps: number) {
    let sample = Float32Array[steps];
    let pickupGridIndex = this.grid.getIndex(0.2);

    for (let i = 0; i < steps; i++) {
      this.step();

      for (let j = 0; j < this.strings.length; j++) {
        sample[i] += this.strings[j].state.y[pickupGridIndex];
      }
    }
  }

  holdFrets(frets: number[]) {
    for (let i = 0; i < frets.length; i++) {
      this.strings[i].fretPosition = this.strings[i].frets[frets[i]];
    }
  }

  strum(position: number) {
    this.strings.forEach(s => s.strum(position));
  }
}

let guitar = new Guitar(grid);

for (let s of guitar.strings) {
  s.addPlot();
}

let stepperTime = 0;
let plottingTime = 0;

function addButton(label: string, handler: () => void) {
  var btn = document.createElement("button");
  btn.innerText = label;
  btn.addEventListener("click", handler);

  document.body.append(btn);
}

function animatePlot() {
  for (let s of guitar.strings) {
    s.updatePlot();
  }
  
  requestAnimationFrame(animatePlot);
}

var audioCtx = new AudioContext();
await audioCtx.audioWorklet.addModule("js/audio-generator.js");

addButton("Play sound", () => {
  var time = audioCtx.currentTime;

  const generatorNode = new AudioWorkletNode(audioCtx, "audio-generator", {
  });

  let sampleIdx = 0;

  generatorNode.connect(audioCtx.destination);
  generatorNode.port.onmessage = (event) => {
    let { message, requestSamples } = event.data;

    let buffer = new Float32Array(requestSamples);
    for (let i = 0; i < requestSamples; i++) {
      guitar.step();
      for (let s of guitar.strings) {
        buffer[i] += s.state.y[10] / guitar.strings.length;
      }
      // prop.step();
      // buffer[i] = Math.sin(2 * Math.PI * 440 * (sampleIdx+i) / audioCtx.sampleRate)
      // buffer[i] = prop.state.y[10];
    }
    sampleIdx += requestSamples;

    generatorNode.port.postMessage(buffer);

  }

  audioCtx.resume();
  // generatorNode.start(time);
  // generatorNode.stop(time + 5);

  animatePlot();
});

function strum(strings: number[] = null) {
  if (strings == null) {
    strings = [0, 1, 2, 3, 4, 5];
  }

  for (let i of strings) {
    guitar.strings[i].pullForce = 1;
    guitar.strings[i].pullPosition = pluckPosition;
  }

  setTimeout(() => {
    for (let s of guitar.strings) {
      s.pullPosition = null;
    }
  }, 20);
}

addButton("Strum", () => {
  strum();
  // prop.pullPosition = pluckPosition;
  // prop.pullForce = 1;
  // setTimeout(() => {
  //   prop.pullPosition = null;
  // }, 20);
  // prop.state.y = pluck(grid, pluckPosition, fretPosition);
})

document.body.addEventListener("keydown", (event) => {
  if (event.key == " ") {
    strum();
  }
  else if (event.key == "e") {
    guitar.holdFrets([0, 2, 2, 1, 0, 0]);
  }
  else if (event.key == "a") {
    guitar.holdFrets([0, 0, 2, 2, 2, 0]);
  }
  else if (event.key == "d") {
    guitar.holdFrets([0, 0, 0, 2, 3, 2]);
  }
});

addButton("E", () => {
  guitar.holdFrets([0, 2, 2, 1, 0, 0]);
  strum();
})

addButton("A", () => {
  guitar.holdFrets([0, 0, 2, 2, 2, 0]);
  strum([1,2,3,4,5]);
})

addButton("D", () => {
  guitar.holdFrets([0, 0, 0, 2, 3, 2]);
  strum([2,3,4,5]);
})

addButton("C", () => {
  guitar.holdFrets([0, 3, 2, 0, 1, 0]);
  strum([1,2,3,4,5]);
});

addButton("G", () => {
  guitar.holdFrets([3, 2, 0, 0, 0, 3]);
  strum();
})

addButton("Am", () => {
  guitar.holdFrets([0, 0, 2, 2, 1, 0]);
  strum([1,2,3,4,5]);
});

addButton("Em", () => {
  guitar.holdFrets([0, 2, 2, 0, 0, 0]);
  strum([0,1,2,3,4,5]);
});
