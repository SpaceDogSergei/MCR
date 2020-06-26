"use strict";

const Majiang = {
  Shoupai: require('./shoupai')
};

module.exports = class He {

constructor() {
  this._pai = [];
  this._count = {};
}

dapai(p) {
  if (!Majiang.Shoupai.valid_pai(p)) throw new Error(p);
  if (p.match(/[\+\=\-]$/)) throw new Error(p);
  this._pai.push(p);

  let _p = p.substr(0, 2)
  if (this._count[_p]) { this._count[_p]++; }
  else { this._count[_p] = 0; }
  return this;
}

fulou(f) {
  this._pai[this._pai.length - 1] += f;
}

count(p) {
  return this._count[p.substr(0, 2)];
}

}
