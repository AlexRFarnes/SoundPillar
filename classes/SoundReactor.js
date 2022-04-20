class SoundReactor {
  constructor(audioUrl) {
    this.ctx;
    this.audio;
    this.audioSource;
    this.analyser;
    this.fdata;
    this.url = audioUrl;
    this.playFlag = false;
    this.initFlag = false;
    this.bind();
  }

  init() {
    this.ctx = new AudioContext(); // The AudioContext interface represents an audio-processing graph built from audio modules linked together, each represented by an AudioNode
    this.audio = new Audio(this.url); // he Audio() constructor creates and returns a new HTMLAudioElement
    this.audioSource = this.ctx.createMediaElementSource(this.audio); // create a new MediaStreamAudioSourceNode object, given a media stream
    this.analyser = this.ctx.createAnalyser(); // The createAnalyser() method of the BaseAudioContext interface creates an AnalyserNode
    this.analyser.smoothingTimeConstant = 0.8;
    this.audioSource.connect(this.analyser); // Allows us to connect the output of this node to be input into another node
    this.audioSource.connect(this.ctx.destination); // Allows us to connect the output of this node to be input into another node
    this.fdata = new Uint8Array(this.analyser.frequencyBinCount);
    this.audio.currentTime = 60;
    this.initFlag = true;
  }

  play() {
    this.audio.play();
    this.playFlag = true;
  }

  pause() {
    this.audio.pause();
    this.playFlag = false;
  }

  update() {
    this.analyser.getByteFrequencyData(this.fdata);
  }

  bind() {
    this.update = this.update.bind(this);
    this.init = this.init.bind(this);
  }
}

const _instance = new SoundReactor(
  "../static/sounds/Kygo-Firestoneft.ConradSewell.mp3"
);
export default _instance;
