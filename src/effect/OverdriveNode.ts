import { CompositeAudioNodeWrapper } from "./AudioNodeWrapper";

export class OverdriveNode extends CompositeAudioNodeWrapper
{
  waveShaper: WaveShaperNode;
  gainUp: GainNode;
  gainDown: GainNode;
  lowpassFilter: BiquadFilterNode;

  _distortion: number;

  constructor(audioCtx: AudioContext) {
    super(audioCtx);

    this.waveShaper = audioCtx.createWaveShaper();
    this.gainUp = audioCtx.createGain();
    this.gainDown = audioCtx.createGain();
    this.lowpassFilter = audioCtx.createBiquadFilter();

    this.node = this.waveShaper;
    this.outputNode = this.lowpassFilter;

    this.waveShaper
      .connect(this.gainUp)
      .connect(this.gainDown)
      .connect(this.lowpassFilter);

    this.waveShaper.oversample = '4x';
    this.distortion = 100;

    this.lowpassFilter.type = 'lowpass';
    this.frequency = 2000;

    let gain = 1;
    this.gainUp.gain.value = gain;
    this.gainDown.gain.value = 1/gain;
  }

  get distortion() { return this._distortion; }
  set distortion(v) {
    this.waveShaper.curve = this.calculateDistortionCurve(v);
    this._distortion = v;
  }

  public get gain() { return this.gainUp.gain.value; }
  public set gain(v) { 
    this.gainUp.gain.value = v;
    this.gainDown.gain.value = 1/v;
  }
  
  public get frequency() { return this.lowpassFilter.frequency.value; }
  public set frequency(v) { this.lowpassFilter.frequency.value = v; }
 
  private calculateDistortionCurve(distortion: number) : Float32Array {
    const amount: number = 44100;
    const deg:number  = Math.PI / 180;
    const curve:Float32Array = new Float32Array(amount);

    for (let i=0; i < amount; ++i ) {
        let x = i * 2 / amount - 1;
        curve[i] = ( 3 + distortion ) * x * 20 * deg / ( Math.PI + distortion * Math.abs(x) );
    }

    return curve;
  };

}
