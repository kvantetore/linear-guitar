import { CompositeAudioNodeWrapper } from "./AudioNodeWrapper";

export class OverdriveNode extends CompositeAudioNodeWrapper
{
  bandPassFilter: BiquadFilterNode;
  wet: GainNode;
  dry: GainNode;
  waveShaper: WaveShaperNode;

  lowpassFilter: BiquadFilterNode;

  _distortion: number;

  constructor(audioCtx: AudioContext) {
    super(audioCtx);

    this.bandPassFilter = audioCtx.createBiquadFilter();
    this.wet = audioCtx.createGain();
    this.dry = audioCtx.createGain();
    this.waveShaper = audioCtx.createWaveShaper();
    this.lowpassFilter = audioCtx.createBiquadFilter();  

    this.node = audioCtx.createGain();
    this.outputNode = this.lowpassFilter;

    //                       /--------- dry gain --------------\
    // input --- band pass --                                   --- low pass
    //                       \--- wet gain --- wave shaper --- /


    this.node.connect(this.bandPassFilter);
    this.bandPassFilter.connect(this.wet);
    this.bandPassFilter.connect(this.dry);
    this.wet.connect(this.waveShaper);
    this.dry.connect(this.lowpassFilter);
    this.waveShaper.connect(this.lowpassFilter);

    this.bandPassFilter.frequency.value = 800;
    this.lowpassFilter.frequency.value = 3000;

    this.distortion = 100;
    this.wetMix = 1.0;
  }

  get distortion() { return this._distortion; }
  set distortion(v) {
    this.waveShaper.curve = this.calculateDistortionCurve(v);
    this._distortion = v;
  }

  get wetMix() { return this.wet.gain.value; }
  set wetMix(v) { 
    this.wet.gain.value = v;
    this.dry.gain.value = 1 - v;
  }

  public get frequency() { return this.lowpassFilter.frequency.value; }
  public set frequency(v) { this.lowpassFilter.frequency.value = v; }

 
  private calculateDistortionCurve(distortion: number) : Float32Array {
    const amount: number = 22050;
    const deg:number  = Math.PI / 180;
    const curve:Float32Array = new Float32Array(amount);

    for (let i=0; i < amount; ++i ) {
        let x = i * 2 / amount - 1;
        curve[i] = ( 3 + distortion ) * x * 20 * deg / ( Math.PI + distortion * Math.abs(x) );
    }

    return curve;
  };

}
