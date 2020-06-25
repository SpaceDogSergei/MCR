module.exports = class Shoupai {

constructor(haipai) {
  this._shouli = {
    m: [0,0,0,0,0,0,0,0,0],
    p: [0,0,0,0,0,0,0,0,0],
    s: [0,0,0,0,0,0,0,0,0],
    z: [0,0,0,0,0,0,0]
  };
  this._fulou = [];
  this._zimo  = null;

  for (var i = 0; i < haipai.length && i < 13; i++) {
    this._shouli[haipai[i][0]][haipai[i][1] - 1]++;
  }
}

fromString(paistr) {
  var haipai = [];
  var shouli = paistr.match(/^[^,]*/)[0];
  for (var substr of shouli.match(/\d+[mpsz]/g)) {
    var s = substr[substr.length - 1];
    for (var n of substr.match(/\d/g)) {
      haipai.push(s+n);
    }
  }
  var zimo;
  while (haipai.length > 13) zimo = haipai.pop();
  var shoupai = new Majiang.Shoupai(haipai);
  if (zimo) shoupai.zimo(zimo);
  return shoupai;
}

toString() {
  var paistr = '';
  for (var s of ['m','p','s','z']) {
    var substr = '';
    for (var n = 0; n < this._shouli[s].length; n++) {
      var num = this._shouli[s][n];
      if (this._zimo && s + (n+1) == this._zimo) num--;
      for (var i = 0; i < num; i++) {
        substr += (n+1);
      }
    }
    if (substr.length > 0) substr += s;
    paistr += substr;
  }
  if (this._zimo && this._zimo.length == 2) {
    paistr += this._zimo[1] + this._zimo[0];
  }
  for (var fulou of this._fulou) {
    paistr += ',' + fulou.substring(1) + fulou[0];
  }
  return paistr;
}

zimo(p) {
  if (! this._zimo) {
    this._zimo = p;
    this._shouli[p[0]][p[1] - 1]++;
  }
}

fulou(p) {
  if (! this._zimo) {
    var s  = p[0];
    var nn = p.match(/\d(?![\-\+\=])/g);
    this._zimo = p;
    this._fulou.push(p);
    for (var n of nn) {
      this._shouli[s][n-1]--;
    }
  }
}

gang(p) {
  if (this._zimo && this._zimo.length == 2) {
    if (this._shouli[p[0]][p[1] - 1] == 4) {
      this._fulou.push(p[0]+p[1]+p[1]+p[1]+p[1]);
    }
    else {
      var regexp = new RegExp('^' + p[0] + p[1] + '{3}');
      for (var i = 0; i < this._fulou.length; i++) {
        if (this._fulou[i].match(regexp)) {
          this._fulou[i] += p[1];
        }
      }
    }
    this._shouli[p[0]][p[1] - 1] = 0;
    this._zimo = null;
  }
}

dapai(p) {
  if (this._zimo) {
    this._zimo = null;
    this._shouli[p[0]][p[1] - 1]--;
  }
}

}
