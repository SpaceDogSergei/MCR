module.exports = class He {

constructor(node, he) {
  this._node = node;
  this._he   = he;
}

static imgHtml(pai = '', htmlClass = '') {
  htmlClass = htmlClass ? 'pai ' + htmlClass : 'pai pai--shouli';
  return pai ? '<img class="' + htmlClass + '" data-pai="' + pai
                 + '" src="img/' + pai + '.gif" />'
         : '<img class="' + htmlClass + '" src="img/pai.gif" />';
}

redraw() {
  this._node.empty();
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
