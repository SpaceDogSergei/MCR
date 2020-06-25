module.exports = class Shan {

constructor(pai) {
  if (pai) {
    this._pai = pai;
  }
  else {
    pai = [];
    var sort = ['m', 'p', 's', 'z'];
    for (var s = 0; s < sort.length; s++) {
      for (var n = 1; n <= 9; n++) {
        if (sort[s] != 'z' || n <= 7) {
          for (var m = 0; m < 4; m++) {
            pai.push(sort[s]+n);
          }
        }
      }
    }
    this._pai = [];
    while (pai.length > 0) {
      var r = Math.floor(Math.random()*pai.length);
      var p = pai[r];
      pai.splice(r, 1);
      this._pai.push(p);
    }
  }

  this._baopai   = [this._pai[4]];
  this._fubaopai = [this._pai[8]];

  this._weikaigang = false;
}

static zhenbaopai(jiabaipai) {
  if (jiabaipai[0] == 'z') {
    if (jiabaipai[1] < 5) return jiabaipai[0] + (jiabaipai[1] % 4 + 1);
    else          return jiabaipai[0] + ((jiabaipai[1] - 4) % 3 + 5);
  }
  else            return jiabaipai[0] + (jiabaipai[1] % 9 + 1);
}

paishu() {
  return this._pai.length - 14;
}

zimo() {
  if (this.paishu() > 0) return this._pai.pop();
}

baopai() {
  var baopai = [];
  for (var pai of this._baopai) {
    baopai.push(zhenbaopai(pai));
  }
  return baopai;
}

fubaopai() {
  var baopai = [];
  for (var pai of this._fubaopai) {
    baopai.push(zhenbaopai(pai));
  }
  return baopai;
}

gangzimo() {
  if (this._baopai.length < 5 && ! this._weikaigang) {
    this._weikaigang = true;
    return this._pai.shift();
  }
}

kaigang() {
  if (this._weikaigang) {
    this._baopai.push(this._pai[4]);
    this._fubaopai.push(this._pai[8]);
    this._weikaigang = false;
  }
}

}
