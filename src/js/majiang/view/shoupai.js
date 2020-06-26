"use strict";

const $ = require('jquery');

const Majiang = { View: { pai: require('./pai') } };

module.exports = class Shoupai {

constructor(node, shoupai, open) {
  this._node = node;
  this._shoupai = shoupai;
  this._open = open;
}

static imgHtml(pai = '', htmlClass = '') {
  htmlClass = htmlClass ? 'pai ' + htmlClass : 'pai pai--shouli';
  return pai ? '<img class="' + htmlClass + '" data-pai="' + pai
                 + '" src="img/' + pai + '.gif" />'
         : '<img class="' + htmlClass + '" src="img/pai.gif" />';
}

redraw() {
  var shouli = this._node.find('.shouli');
  shouli.empty();
  for (var s of ['m','p','s','z']) {
    for (var n = 0; n < this._shoupai._shouli[s].length; n++) {
      var pai = s + (n+1);
      var num = this._shoupai._shouli[s][n];
      if (this._shoupai._zimo && pai == this._shoupai._zimo) num--;
      for (var i = 0; i < num; i++) {
        if (! this._open) pai = null;
        shouli.append(Shoupai.imgHtml(pai, this._node.hasClass('shoupai--zijia') ? 'pai--zijiaShouli' : ''));
      }
    }
  }
  if (this._shoupai._zimo && this._shoupai._zimo.length == 2) {
    var pai = this._open ? this._shoupai._zimo : null;
    shouli.append('<span class="paiWrapZimo">' + Shoupai.imgHtml(pai, this._node.hasClass('shoupai--zijia') ? 'pai--zijiaShouli' : '') + '</span>');
  }

  var fulou = this._node.find('.fulou');
  fulou.empty();
  for (var mianzi of this._shoupai._fulou) {
    var html = '<span class="fulou__mianzi">';
    var s = mianzi[0];
    if (mianzi.match(/^.(?!(\d)\1).*$/)) {        // 顺子
      var nn = (mianzi.match(/\d(?=\-)/)).concat(
            mianzi.match(/\d(?![\-\+\=])/g));
      html += '<span class="paiWrapRotate">' + Shoupai.imgHtml(s + nn[0], 'pai--fulou pai--rotate') + '</span>';
      html += Shoupai.imgHtml(s + nn[1], 'pai--fulou') + Shoupai.imgHtml(s + nn[2]), 'pai--fulou';
    }
    if (mianzi.match(/^.(\d)\1\1\1?[\-\+\=]\1?$/)) {  // 刻子 or 明杠子
      var n  = mianzi[1];
      var d  = mianzi.match(/[\-\+\=]/).shift();
      var nn = mianzi.match(/\d+/).shift().match(/\d/g);
      var jiagang = (mianzi.match(/[\-\+\=]\d$/) != null);
      var img  = Shoupai.imgHtml(s + n, 'pai--fulou');
      var img_r0 = Shoupai.imgHtml(s + n, 'pai--fulou pai--rotate');
      var img_r  = '<span class="paiWrapRotate">' + (jiagang ? img_r0 + img_r0 : img_r0) + '</span>';
      for (var i = 0; i < nn.length; i++) { nn[i] = img }
      if (d == '-') nn[0]      = img_r;
      if (d == '=') nn[1]      = img_r;
      if (d == '+') nn[nn.length -1] = img_r;
      for (var str of nn) { html += str }
    }
    if (mianzi.match(/^.(\d)\1\1\1$/)) {        // 暗杠子
      n = mianzi[1];
      html += Shoupai.imgHtml('', 'pai--fulou') + Shoupai.imgHtml('', 'pai--fulou') + Shoupai.imgHtml('', 'pai--fulou') + Shoupai.imgHtml('', 'pai--fulou');
    }
    html += '</span>';
    fulou.prepend($(html));
  }
}

}
