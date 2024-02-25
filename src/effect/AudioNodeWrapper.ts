type AudioNodeOrWrapper = (AudioNode|AudioNodeWrapper);

export class AudioNodeWrapper
{
  audioContext: AudioContext;
  node: (AudioNode);

  constructor(audioContext : AudioContext, inputNode: AudioNode = null) {
    this.audioContext = audioContext;
    this.node = inputNode;
  }

  connect(target: AudioNodeOrWrapper): AudioNodeOrWrapper {
    if (target instanceof AudioNodeWrapper)
    {
      this.node.connect(target.node);
    }
    else {
      this.node.connect(target);
    }

    return target;
  }

  disconnect() {
    this.node.disconnect();
  }
}

export class CompositeAudioNodeWrapper extends AudioNodeWrapper {
  outputNode: AudioNode;

  constructor(audioContext: AudioContext) {
    super(audioContext)
  }

  connect(target: AudioNodeOrWrapper): AudioNodeOrWrapper {
    if (target instanceof AudioNodeWrapper){
      this.outputNode.connect(target.node);
    }
    else {
      this.outputNode.connect(target)
    }

    return target;
  }

  disconnect(): void {
    this.outputNode.disconnect();
  }
}