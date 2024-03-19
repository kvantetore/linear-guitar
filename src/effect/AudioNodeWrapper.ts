type AudioNodeOrWrapper = (AudioNode | AudioNodeWrapper);

export class AudioNodeWrapper {
  audioContext: AudioContext;
  node: (AudioNode);

  constructor(audioContext: AudioContext, inputNode: AudioNode = null) {
    this.audioContext = audioContext;
    this.node = inputNode;
  }

  connect(target: AudioNodeOrWrapper): AudioNodeWrapper {
    if (target instanceof AudioNodeWrapper) {
      this.node.connect(target.node);
      return target;
    }
    else {
      var wrapper = new AudioNodeWrapper(this.audioContext, target);
      this.node.connect(wrapper.node);
      return wrapper;
    }
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

  connect(target: AudioNodeOrWrapper): AudioNodeWrapper {
    if (target instanceof AudioNodeWrapper) {
      this.outputNode.connect(target.node);
      return target;
    }
    else {
      var wrapper = new AudioNodeWrapper(this.audioContext, target);
      this.outputNode.connect(wrapper.node)
      return wrapper;
    }

  }

  disconnect(): void {
    this.outputNode.disconnect();
  }
}