"use strict";

const Majiang = {
  Shoupai: require('./shoupai')
};

module.exports = class Shan {

constructor(pai) {
  if (pai) {
    this._pai = pai;
  } else {
    let pai = [];
    for (let s of ['m', 'p', 's', 'z']) {
      for (let n = 1; n <= (s == 'z' ? 7 : 9); n++) {
        for (let i = 0; i < 4; i++) {
          pai.push(s+n);
        }
      }
    }
    this._pai = [];
    while (pai.length > 0) {
      var r = Math.floor(Math.random() * pai.length);
      var p = pai[r];
      pai.splice(r, 1);
      this._pai.push(p);
    }
  }
  this._isKaigang = false;
}

paishu() {
  return this._pai.length;
}

zimo() {
  if (this.paishu() == 0) throw new Error(this);
  if (this._isKaigang) throw new Error(this);
  return this._pai.pop();
}

kaigang() {
  if (!this._isKaigang) throw new Error(this);
  this._isKaigang = false;
}

gangzimo() {
  if (this.paishu() == 0) throw new Error(this);
  if (this._isKaigang) throw new Error(this);
  this._isKaigang = true;
  return this._pai.shift();
}

kaigang() {
  if (!this._isKaigang) throw new Error(this);
  this._isKaigang = false;
}

}
