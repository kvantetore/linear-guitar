import { createPluckedString, } from "../tools/propagation";
import { createRegularGrid } from "../tools/grid";
import { addHeader, addMathText } from "../tools/math";
import { addBarPlot, addLinePlot } from "../tools/plotting";
import { String } from "../guitar/string";

export function slide6() {
    addHeader("From String to Waveform")
    var grid = createRegularGrid(0, 1, 64);
    var dt = 1/256;
   
    let string = new String(grid, dt, 1);
    string.setInitialValue(createPluckedString(grid, 0.3));
    string.dampingCoefficient = 0.1;

    var line = addLinePlot(grid.x, string.f);
    line.addClickListener((event) => {
        string.setInitialValue(createPluckedString(grid, event.x));
        line.update(grid.x, string.f);
    });

    let markerGridIndex = grid.getIndex(0.3);
    let marker = line.addMarker(0.3, 0, "red");
    line.addVertical(0.3, "gray")

    let waveform = Array(1024);
    waveform.fill(0);
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

        string.step();
        line.update(grid.x, string.f);

        var sample = string.f[markerGridIndex];
        waveform.splice(0, 0, sample);
        waveform.pop();
        waveformPlot.update(t.x, waveform);
        
        marker.update(0.3, sample, "red");
    }, 1000 * dt);
}