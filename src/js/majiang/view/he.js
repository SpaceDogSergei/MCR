"use strict";

const $ = require('jquery');
const Majiang = { View: { pai: require('./pai') } };

module.exports = class He {

constructor(node, he, open) {
  this._node = {
    hepai: $('.he', root),
    // TODO: huapai
    // huapai: $('.huapai', root),
  }
  this._he = he;
  this._open = open;
  // TODO: huapai
}

static imgHtml(pai = '', htmlClass = '') {
  htmlClass = htmlClass ? 'pai ' + htmlClass : 'pai pai--shouli';
  return pai ? '<img class="' + htmlClass + '" data-pai="' + pai
                 + '" src="img/' + pai + '.gif" />'
         : '<img class="' + htmlClass + '" src="img/pai.gif" />';
}

redraw(open) {
  if (open != null) this._open = open;

  this._node.hepai.empty();
  var i = 0;
  for (var pai of this._he._pai) {
    if (pai.match(/[\-\+\=]$/)) continue;
    else this._node.append($(He.imgHtml(pai, 'pai--he')));
    i++;
    if (i < 24 && i % 6 == 0) {
      this._node.append($('<span class="he__break"></span>'))
    }
  }
}

dapai(p) {
  this._node.append($(He.imgHtml(p.substr(0, 2), 'pai--he pai--dapai')));
}

}
