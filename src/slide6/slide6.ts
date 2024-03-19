import { standingWave } from "../tools/functions";
import { calculateOverlap, createPluckedString, createSawtoothWave, createSquareWave, createStandingWave, diff2, signedSquare } from "../tools/propagation";
import { createRegularGrid } from "../tools/grid";
import { addHeader, addMathText } from "../tools/math";
import { addBarPlot, addLinePlot } from "../tools/plotting";

export function slide6() {
    addHeader("From String to Waveform")

    var grid = createRegularGrid(0, 1, 32);
    var f = createPluckedString(grid, 0.4);
    var v = grid.x.map(x => 0);

    var dt = 1/128;

    var line = addLinePlot(grid.x, f);
    line.addClickListener((event) => {
        f = createPluckedString(grid, event.x);
        v.fill(0);
        line.update(grid.x, f);
    });

    let markerGridIndex = grid.getIndex(0.3);
    let marker = line.addMarker(0.3, 0, "red");
    line.addVertical(0.3, "gray")

    let c = 1;
    let damping = 0.1;

    let range = [...Array(grid.N).keys()];

    let waveform = Array(1024);
    waveform.fill(f[markerGridIndex]);
    let t = createRegularGrid(0, 1, 1024);
    let waveformPlot = addLinePlot(t.x, waveform);

    let pause = true;
    document.addEventListener("keydown", (event) => {
        if (event.key == "p") {
            pause = !pause;
        }
    })

    setInterval(() => {
        if (pause) {
            return;
        }

        let op = diff2(grid, f)
        let force = range.map(i => op[i] * c - v[i] * damping)

        let vnext = range.map(i => v[i] + dt * force[i]);
        let fnext = range.map(i => f[i] + dt * vnext[i]);

        v = vnext;
        f = fnext;
        line.update(grid.x, f);

        var sample = f[markerGridIndex];

        waveform.splice(0, 0, sample);
        waveform.pop();
        waveformPlot.update(t.x, waveform);
        
        marker.update(0.3, sample, "red");

    }, 1000 * dt);
}