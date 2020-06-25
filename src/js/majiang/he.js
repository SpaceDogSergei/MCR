module.exports = class He {

constructor() {
  this._pai = [];
}

dapai(p) {
  this._pai.push(p);
}

fulou(f) {
  this._pai[this._pai.length - 1] += f;
}

}
