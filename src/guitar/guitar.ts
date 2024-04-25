import { addStringPlot } from "../tools/ui";
import { String } from "./string";

export class Guitar {
    audioCtx: AudioContext;
    grid: IGrid;
    strings: AudioWorkletNode[] = [];
    volumeNode: GainNode;

    plots: any[] = [];
    stringSnapshots: Float32Array[] = [];

    baseFrequencies = [
        82.,
        110.,
        146.,
        196.,
        246.,
        329.,        
    ]

    constructor(audioCtx: AudioContext, grid: IGrid) {
        this.audioCtx = audioCtx;
        this.grid = grid;

        // create string nodes
        let subSteps = 4
        this.strings = [
            new AudioWorkletNode(audioCtx, "string-node", { processorOptions: { N: grid.N, subSteps: subSteps} }),
            new AudioWorkletNode(audioCtx, "string-node", { processorOptions: { N: grid.N, subSteps: subSteps} }),
            new AudioWorkletNode(audioCtx, "string-node", { processorOptions: { N: grid.N, subSteps: subSteps} }),
            new AudioWorkletNode(audioCtx, "string-node", { processorOptions: { N: grid.N, subSteps: subSteps} }),
            new AudioWorkletNode(audioCtx, "string-node", { processorOptions: { N: grid.N, subSteps: subSteps} }),
            new AudioWorkletNode(audioCtx, "string-node", { processorOptions: { N: grid.N, subSteps: subSteps} }),
        ];

        for (let i = 0; i < this.strings.length; i++) {
            this.strings[i].parameters.get("frequency").value = this.baseFrequencies[i];
            this.strings[i].parameters.get("pickupPosition").value = 0.2;
        }
    

        // create volume node, and connect output from all string nodes to volume node
        this.volumeNode = audioCtx.createGain();
        for (let s of this.strings) {
            s.connect(this.volumeNode);
        }
        this.volumeNode.gain.value = 3

        // maintain a snapshot of string on event from string nodes for plotting
        this.stringSnapshots = this.strings.map(s => new Float32Array(grid.x.length));
        for (let i = 0; i < this.strings.length; i++) {
            this.strings[i].port.onmessage = (event) => {
                if (event.data.message == "f") {
                    this.updateSnapshot(i, event.data.f);
                }
            };
        }

    }

    animate() {
        // crete y
        this.plots = this.strings.map(s => addStringPlot(this.grid, s));

        // run animation
        function animatePlot() {
            this.updatePlots();
            requestAnimationFrame(animatePlot.bind(this));
        }
        requestAnimationFrame(animatePlot.bind(this));

    }

    private updateSnapshot(i: number, snapshot: Float32Array) {
        this.stringSnapshots[i] = snapshot;
    }

    holdFrets(frets: number[]) {
        let time = this.audioCtx.currentTime;
        for (let i = 0; i < frets.length; i++) {
            let start = this.strings[i].parameters.get("fretPosition").value;
            let end = String.frets[frets[i]]
            // this.strings[i].parameters.get("fretPosition").setValueCurveAtTime([this.strings[i].parameters.get("fretPosition").value, frets[i]], time, 0.1);
            this.strings[i].parameters.get("fretPosition")
                .cancelScheduledValues(time)
                .setValueCurveAtTime([start, end], time, 0.1);
            this.strings[i].parameters.get("dampingCoefficient")
                .cancelScheduledValues(time)
                .setValueAtTime(4, time + 0.1)
        }
    }

    releaseFrets() {
        let time = this.audioCtx.currentTime;
        for (let i = 0; i < this.strings.length; i++) {
            let start = this.strings[i].parameters.get("fretPosition").value;
            let end = 1;
            this.strings[i].parameters.get("fretPosition")
                .cancelScheduledValues(time)
                .setValueCurveAtTime([start, end], time + 0.1, 0.1);
            this.strings[i].parameters.get("dampingCoefficient")
                .cancelScheduledValues(time)
                .setValueCurveAtTime([4, 100, 4], time, 0.2)
        }
    }

    chordStrings: number[] = [0, 1, 2, 3, 4, 5];

    setChordStrings(chordStrings: number[] = [0, 1, 2, 3, 4, 5], delay: number = 0.05) {
        let time = this.audioCtx.currentTime;
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

    setTremolo(value) {
        this.strings.forEach((string, i) => {
            string.parameters.get("frequency").value = this.baseFrequencies[i] * (1 - value);
        });

    }

    updatePlots() {
        for (let i = 0; i < this.plots.length; i++) {
            this.plots[i].update(this.stringSnapshots[i]);
        }

        for (let i = 0; i < this.strings.length; i++) {
            this.strings[i].port.postMessage({ message: "requestF" });
        }
    }
}
