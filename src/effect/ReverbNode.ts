import { CompositeAudioNodeWrapper } from "./AudioNodeWrapper";

export class ReverbNode extends CompositeAudioNodeWrapper
{
  convolverNode: ConvolverNode;
  inputGainNode: GainNode;
  levelGainNode: any;
  wetGainNode: GainNode;
  outputGainNode: GainNode;

  constructor(audioCtx: AudioContext) {
    super(audioCtx);

    this.inputGainNode = audioCtx.createGain();
    this.convolverNode = audioCtx.createConvolver();
    this.levelGainNode = audioCtx.createGain();
    this.wetGainNode = audioCtx.createGain();
    this.outputGainNode = audioCtx.createGain();

    this.node = this.inputGainNode;
    this.outputNode = this.outputGainNode;

    //                /--- convolver ---- level gain ---\
    //  input gain ---                                   ----- output gain
    //                \---------- wet gain -------------/

    // connect nodes
    this.inputGainNode
      .connect(this.convolverNode)
      .connect(this.levelGainNode)
      .connect(this.outputGainNode);

    this.inputGainNode
      .connect(this.wetGainNode)
      .connect(this.outputGainNode);

    // set default parameters
    // reverb input response from https://github.com/cwilso/WebAudio
    this.loadInputResponse('/samples/irHall.ogg');

    this.wetGain = 0.5;
    this.levelGain = 1;
  }
  
  get wetGain() { return this.wetGainNode.gain.value; }
  set wetGain(v) { this.wetGainNode.gain.value = v; }

  get levelGain() { return this.levelGainNode.gain.value; }
  set levelGain(v) { this.levelGainNode.gain.value = v; }

  private async loadInputResponse(url: string) {
    var result = await fetch(url);
    var audioBuffer = await this.audioContext.decodeAudioData(await result.arrayBuffer());
    this.convolverNode.buffer = audioBuffer;
  };

}
