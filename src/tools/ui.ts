import { addLinePlot } from "./plotting";
import { String } from "../guitar/string";
import { Guitar } from "../guitar/guitar";

export function addButton(label: string, handler: () => void) {
    var btn = document.createElement("button");
    btn.innerText = label;
    btn.addEventListener("click", handler);

    document.body.append(btn);
}

export function animateString(grid, stringNode: AudioWorkletNode, plot) {
    var running = true;

    stringNode.port.onmessage = event => {
        if (event.data.message == "f") {
            var f = event.data.f;
            plot.update(grid.x, f);

            if (running) {
                requestAnimationFrame(requestData);
            }
        }
    };

    function requestData() {
        stringNode.port.postMessage({
            message: "requestF"
        });
    }

    requestAnimationFrame(requestData);

    return {
        stop: () => running = false,
    }
}

export function addPopup(message: string) {
    let elem = document.createElement("div");
    elem.className = "popup";
    elem.innerText = message;

    document.body.append(elem);

    setTimeout(() => {
        document.body.removeChild(elem);
    }, 1500)

}


export function addStringPlot(grid: IGrid, string: AudioWorkletNode) {
    var y = grid.x.map(x => 0)
    let plot = addLinePlot(grid.x, y, { height: 66 });
    let fretMarker = plot.addMarker(1, 0, "red");
    let pullMarker = plot.addMarker(1, 0, "gray");
    let pickupMarker = plot.addMarker(1, 0, "black");
    let audioCtx = string.context;

    plot.container.style.margin = "0";

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

let bpm = 122;
let eighthDuration = 60 / bpm / 2;
let measureDuration = 8 * eighthDuration;

export function addGuitarKeyboardInput(guitar: Guitar) {
    let audioCtx = guitar.audioCtx;
    let holdingChord: string = null;

    document.body.addEventListener("keydown", (event) => {
        if (event.key != null && event.key === holdingChord) {
            return;
        }

        console.log("key", event.key, event.ctrlKey, event.code);
        var unhandled = false;
        if (event.code == "Escape") {
        }
        else if (event.code == "Digit1") {
        }
        else if (event.code == "Digit2") {
        }
        else if (event.code == "Digit3") {
        }
        else if (event.code == "Digit4") {
        }
        else if (event.code == "Digit5") {
        }
        else if (event.code == "Digit6") {
        }
        else if (event.code == "Digit7") {
            guitar.pluckChordAtTime(guitar.chordStrings, audioCtx.currentTime + 0.05, 1.5);
        }
        else if (event.code == "Digit9") {
            guitar.strumDownAtTime(guitar.chordStrings, audioCtx.currentTime + 0.05, 0.2);
        }
        else if (event.code == "Digit8") {
            guitar.strumDownAtTime(guitar.chordStrings, audioCtx.currentTime + 0 * eighthDuration, eighthDuration / 8);
            guitar.strumDownAtTime(guitar.chordStrings, audioCtx.currentTime + 2 * eighthDuration, eighthDuration / 8);
            guitar.strumUpAtTime(guitar.chordStrings, audioCtx.currentTime + 3 * eighthDuration, eighthDuration / 8);
            // guitar.strumDownAtTime(guitar.chordStrings, audioCtx.currentTime + 4 * eighthDuration, eighthDuration / 8);
            // guitar.strumDownAtTime(guitar.chordStrings, audioCtx.currentTime + 6 * eighthDuration, eighthDuration / 8);
            // guitar.strumUpAtTime(guitar.chordStrings, audioCtx.currentTime + 7 * eighthDuration, eighthDuration / 8);
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
            // always a-minor (for the rising sun!)
            guitar.holdFrets([0, 0, 2, 2, 1, 0])
            guitar.setChordStrings([1, 2, 3, 4, 5]);
            // guitar.holdFrets([0, 0, 2, 2, 2, 0]);
            // guitar.setChordStrings([1, 2, 3, 4, 5]);
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
            // if (event.ctrlKey) {
                guitar.holdFrets([0, 2, 1, 2, 0, 2])
                guitar.setChordStrings([1, 2, 3, 4, 5])
                holdingChord = event.key;
            // }
            // else {
            //     guitar.holdFrets([0, 2, 4, 4, 3, 0])
            //     guitar.setChordStrings([1, 2, 3, 4])
            //     holdingChord = event.key;
            // }
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
        console.log(event);

        if (event.key != null && event.key.toLowerCase() == holdingChord?.toLocaleLowerCase()) {
            holdingChord = null;
            guitar.releaseFrets();
        }
    })
}