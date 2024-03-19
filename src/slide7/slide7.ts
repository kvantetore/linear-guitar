import { createRegularGrid } from "../tools/grid";
import { addLinePlot } from "../tools/plotting";
import { addButton, addStringPlot } from "../tools/ui";

export async function slide7() {
    var audioCtx = new AudioContext({
    });
    await audioCtx.audioWorklet.addModule("js/guitar/string-node.js");
    
    var grid = createRegularGrid(0, 1, 256);
    var stringNode = new AudioWorkletNode(audioCtx, "string-node", { processorOptions: { 
        N: grid.N,
        subSteps: 2,
    }});

    let pullPosition = 0.3;
    let pickupPosition = 0.03;
    let fretPosition = 0.8;

    stringNode.parameters.get("frequency").value = 82.4;
    stringNode.parameters.get("pullPosition").value = pullPosition;
    stringNode.parameters.get("pickupPosition").value = pickupPosition;
    stringNode.parameters.get("pickupPosition").value = pickupPosition;
    stringNode.parameters.get("fretPosition").value = fretPosition;
    stringNode.parameters.get("dampingCoefficient").value = 1;

    var gainNode = new GainNode(audioCtx);
    gainNode.gain.value = 5;

    stringNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    var f = [...Array(grid.N).values()].map(v => 0);
    var plot = addLinePlot(grid.x, f);
    plot.addMarker(pullPosition, 0, 'white');
    plot.addMarker(pickupPosition, 0, 'green');
    var fretMarker = plot.addMarker(fretPosition, 0, 'red');

    stringNode.port.onmessage = event => {
        if (event.data.message == "f") {
            f = event.data.f;
            plot.update(grid.x, f);
            
            requestAnimationFrame(requestData);
        }
    };

    function requestData() {
        stringNode.port.postMessage({
           message: "requestF" 
        });
    }

    requestAnimationFrame(requestData);


    // addButton("Pull", () => {
    //     stringNode.parameters.get("pullForce").setValueAtTime(0, audioCtx.currentTime);
    //     stringNode.parameters.get("pullForce").linearRampToValueAtTime(1, audioCtx.currentTime + 0.01);
    // })

    // addButton("Release", () => {
    //     stringNode.parameters.get("pullForce").value = 0;
    // });

    addButton("Strum", () => {
        stringNode.parameters.get("pullForce").setValueAtTime(0, audioCtx.currentTime);
        stringNode.parameters.get("pullForce").linearRampToValueAtTime(1, audioCtx.currentTime + 0.01);
        stringNode.parameters.get("pullForce").setValueAtTime(0, audioCtx.currentTime + 0.01);
    });

    for (let i = 0; i<=12; i++) {
        addButton(`${i}`, () => {
            fretPosition = Math.pow(2, - i / 12);
            stringNode.parameters.get("fretPosition").value = fretPosition;
            fretMarker.update(fretPosition, 0, 'red');
        })
    }

}

