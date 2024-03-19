import { keys } from "mathjax-full/js/util/Options";
import { standingWave } from "../tools/functions";
import { calculateOverlap, createPluckedString, createSawtoothWave, createSquareWave, createStandingWave, diff2, signedSquare } from "../tools/propagation";
import { createRegularGrid } from "../tools/grid";
import { addHeader, addMathText } from "../tools/math";
import { addBarPlot, addLinePlot } from "../tools/plotting";

export function slide5() {
    addHeader("Numerical Solution")

    var grid = createRegularGrid(0, 1, 64);
    let range = [...Array(grid.N).keys()];

    var f1 = createSquareWave(grid, 0.1, 0.3);
    // var f2 = createStandingWave(grid, 2);
    // var f = range.map(i => (f1[i] + f2[i])/2);
    var f = f1
    var v = grid.x.map(x => 0);

    var dt = 1/128;

    var line = addLinePlot(grid.x, f);
    line.addClickListener((event) => {
        f = createPluckedString(grid, event.x);
        v.fill(0);
    });


    addHeader("Harmonic Analysis")
    let baseFunctions = [...Array(8).keys()].map(i => createStandingWave(grid, i + 1));

    let amplitudes = baseFunctions.map((b, i) => calculateOverlap(grid, b, f));
    let labels = baseFunctions.map((b, i) => `n = ${i+1}`);

    let barPlot = addBarPlot(amplitudes, labels);

    let c = 1;
    let damping = 0.1;


    var pause = true;
    document.addEventListener("keydown", (event) => {
        if (event.key == "p") {
            pause = !pause;
        }
    });

    setInterval(() => {
        if (!pause)
        {
            let op = diff2(grid, f)
            let force = range.map(i => op[i] * c - v[i] * damping)

            let vnext = range.map(i => v[i] + dt * force[i]);
            let fnext = range.map(i => f[i] + dt * vnext[i]);

            v = vnext;
            f = fnext;
        }

        line.update(grid.x, f);

        let amplitudes = baseFunctions.map(b => calculateOverlap(grid, b, f));
        barPlot.update(amplitudes);


    }, 1000 * dt);
}