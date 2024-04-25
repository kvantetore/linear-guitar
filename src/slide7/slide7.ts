import { createRegularGrid } from "../tools/grid";
import { addLinePlot } from "../tools/plotting";
import { addButton, addStringPlot } from "../tools/ui";

export async function slide7() {
    var audioCtx = new AudioContext({});
    await audioCtx.audioWorklet.addModule("js/guitar/string-node.js");

    var grid = createRegularGrid(0, 1, 128);
    var stringNode = new AudioWorkletNode(audioCtx, "string-node", {
        processorOptions: {
            N: grid.N,
            subSteps: 2,
        }
    });

    let f = grid.x.map(x => 0);
    let plot = addLinePlot(grid.x, f);

    stringNode.port.onmessage = event => {
        if (event.data.message == "f") {
            plot.update(grid.x, event.data.f);
        }

        requestAnimationFrame(requestData);
    };
    function requestData() {
        stringNode.port.postMessage({
            message: "requestF"
        });
    }
    requestData();

    var gainNode = new GainNode(audioCtx, {
        gain: 5
    });

    stringNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    addButton("pull", () => {
        stringNode.parameters.get("pullForce").value = 1;
    })
    addButton("release", () => {
        stringNode.parameters.get("pullForce").value = 0;
    })
    addButton("strum", () => {
        stringNode.parameters.get("pullForce").setValueAtTime(0, audioCtx.currentTime)
        stringNode.parameters.get("pullForce").linearRampToValueAtTime(1, audioCtx.currentTime + 0.1);
        stringNode.parameters.get("pullForce").setValueAtTime(0, audioCtx.currentTime + 0.1)
    })
}