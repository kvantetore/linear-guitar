import { createRegularGrid } from "../tools/grid";
import { String } from "./string";

class StringNode extends AudioWorkletProcessor {
    grid: IGrid;
    string: String;
    subSteps: number;

    static get parameterDescriptors() {
        return [
            {
                name: "fretPosition",
                defaultValue: 1,
                minValue: 0.1,
                maxValue: 1,
                automationRate: "a-rate",
            },
            {
                name: "pullPosition",
                defaultValue: 0.25,
                minValue: 0,
                maxValue: 1,
                automationRate: "a-rate",
            },
            {
                name: "pullForce",
                defaultValue: 0,
                minValue: -10,
                maxValue: 10,
                automationRate: "a-rate",
            },
            {
                name: "pickupPosition",
                defaultValue: 0.23,
                minValue: 0,
                maxValue: 1,
                automationRate: "a-rate",
            },
            {
                name: "dampingCoefficient",
                defaultValue: 4,
                minValue: 0,
                maxValue: 1000,
                automationRate: "a-rate",
            },
            { 
                name: "frequency",
                defaultValue: 82,
                minValue: 10,
                maxValue: 1200,
                automationRate: "a-rate"
            }
        ]
    }

    constructor(args: any) {
        super()

        var N = args?.processorOptions?.N ?? 128;
        var dt = 1/sampleRate;

        var frequency = args?.processorOptions?.frequency ?? 82;
        var subSteps = args?.processorOptions?.subSteps ?? 2;

        this.grid = createRegularGrid(0, 1, N);
        this.string = new String(this.grid, dt / subSteps, frequency);
        this.subSteps = subSteps;

        this.port.onmessage = this.onmessage.bind(this);
    }

    process(inputs, outputs, parameters) {
        const output = outputs[0];

        // propagate string and sample into output buffer
        let buffer = new Float32Array(output[0].length);
        for (let i = 0; i < buffer.length; i++) {
            this.string.frequency = this.getParam(parameters.frequency, i);
            this.string.pullPosition = this.getParam(parameters.pullPosition, i);
            this.string.pullForce = this.getParam(parameters.pullForce, i);
            this.string.dampingCoefficient = this.getParam(parameters.dampingCoefficient, i);
            this.string.fretPosition = this.getParam(parameters.fretPosition, i);

            for (let subStep = 0; subStep<this.subSteps; subStep++)
            {
                this.string.step();
            }

            let pickupIndex = this.grid.getIndex(this.getParam(parameters.pickupPosition, i));
            buffer[i] = this.string.f[pickupIndex] / 6;
        }

        // copy to output channels
        for (let channel = 0; channel < output.length; channel++)
        {
            for (let i = 0; i<buffer.length; i++) {
                output[channel][i] = buffer[i];
            }
        }

        return true;
    }

    getParam(param: Float32Array, index: number) {
        if (param.length == 1) {
            return param[0];
        }

        return param[index];
    }

    onmessage(event) {
        let { data } = event;

        if (data.message === "requestF") {
            this.port.postMessage({ message: "f", f: this.string.f });
        }
    }
}


registerProcessor("string-node", StringNode);