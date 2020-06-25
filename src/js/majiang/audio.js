module.exports = class Audio {

constructor() {
  this._audio = {
    dapai: new Audio('audio/dapai.wav'),
    chi:   new Audio('audio/chi.wav'),
    peng:  new Audio('audio/peng.wav'),
    gang:  new Audio('audio/gang.wav'),
    rong:  new Audio('audio/rong.wav'),
    zimo:  new Audio('audio/zimo.wav'),
  };
}

static volume(level) {
  for (var name in this._audio)
    this._audio[name].volume = level / 5;
}

// TODO: Audio
static play(name) {
  // this._audio[name].play();
}

}
