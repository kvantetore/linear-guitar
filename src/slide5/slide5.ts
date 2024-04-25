import { createRegularGrid } from "../tools/grid";
import { addHeader, addMathText } from "../tools/math";
import { addBarPlot, addLinePlot } from "../tools/plotting";
import { calculateOverlap, createPluckedString, createSquareWave, createStandingWave, diff2 } from "../tools/propagation";

export function slide5() {
    addHeader("Numerical Solution")
    let grid = createRegularGrid(0, 1, 64);
    let f0 = createPluckedString(grid, 0.3);

    let range = [...Array(grid.N).keys()];

    let line = addLinePlot(grid.x, f0);

    let f = f0;
    let v = grid.x.map(x => 0);

    let c = 1;
    let dt = 1 / 128;

    let damping = 0.5;

    let baseFunctions = [...Array(8).keys()].map(i => createStandingWave(grid, i + 1));
    let labels = baseFunctions.map((b, i) => `n = ${i}`);
    let amplitudes = baseFunctions.map(b => calculateOverlap(grid, b, f));

    let barPlot = addBarPlot(amplitudes, labels);

    setInterval(() => {
        let dydx = diff2(grid, f);
        let force = range.map(i => c * dydx[i] - damping * v[i]);

        let vnext = range.map(i => v[i] + force[i] * dt);
        let fnext = range.map(i => f[i] + vnext[i] * dt);

        v = vnext;
        f = fnext;

        line.update(grid.x, f);

        let amplitudes = baseFunctions.map(b => calculateOverlap(grid, b, f));
        barPlot.update(amplitudes);
    }, 1000 * dt);
}