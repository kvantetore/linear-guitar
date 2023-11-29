class AudioGenerator extends AudioWorkletProcessor {
    private _buffer: RingBuffer;
    private _minAvailable: number;
    private _requestSamples: number;

    constructor(args: AudioWorkletProcessorConstructor, arg2: any) {
        super()
        
        this._buffer = new RingBuffer(128 * 100);
        this._minAvailable = 128 * 20;
        this._requestSamples = 128 * 3;

        this.port.onmessage = this.onmessage.bind(this);
    }

    process(inputs, outputs, parameters) {
        const output = outputs[0];

        // read into first channel
        let buffer = new Float32Array(output[0].length);
        this._buffer.read(buffer);
        
        // copy to other channels
        for (let channel = 0; channel < output.length; channel++)
        {
            for (let i = 0; i<buffer.length; i++) {
                output[channel][i] = buffer[i];
            }
        }

        if (this._buffer.availableSamples() <= this._minAvailable) {
            this.port.postMessage({
                message: "requestData", 
                requestSamples: this._requestSamples,
            });
        }

        return true;
    }

    onmessage(event) {
        let { data } = event;

        var input = new Float32Array(data);
        this._buffer.write(data);
    }
}

class RingBuffer
{
    private _buffer: Float32Array;
    private _writeIndex: number;
    private _readIndex: number;
    private _available: number;

    constructor(length: number) {
        this._buffer = new Float32Array(length);
        this._readIndex = 0;
        this._writeIndex = 0;
        this._available = 0;
    }

    availableSamples() {
        return this._available;
    }

    write(input: Float32Array)
    {
        if (this._buffer.length < this._available + input.length) {
            console.warn(`buffer overflow` )
            return false;
        }

        for (let i=0; i<input.length; i++) {
            this._buffer[this._writeIndex++] = input[i];
            if (this._writeIndex >= this._buffer.length) {
                this._writeIndex = 0;
            }
        }

        this._available += input.length;
    }

    read(output: Float32Array)
    {
        if (this._available < output.length) {
            console.warn("buffer underflow");
            return false;
        }

        for (let i=0; i<output.length; i++) {
            output[i] = this._buffer[this._readIndex++]; 
            if (this._readIndex >= this._buffer.length) {
                this._readIndex = 0;
            }
        }

        this._available -= output.length;
        return true;
    }
}

registerProcessor("audio-generator", AudioGenerator);