module.exports = class Chang {

constructor(node, chang) {
  this._node   = node;
  this._chang  = chang;
  this._lunban = [];
}

redraw() {
  var menfeng = ['東','南','西','北'];
  var jushu   = ['一','二','三','四'];
  var feng  = ['zijia','xiajia','duimian','shangjia'];

  this._node.find('.jushu').text(
        menfeng[this._chang.menfeng] + jushu[this._chang.jushu] + '局');
  this._node.find('.defen.lunban').removeClass('lunban');

  for (var i = 0; i < 4; i++) {
    var f = feng[(this._chang.qijia + this._chang.jushu + i) % 4];
    var defen = '' + this._chang.defen[i];
    defen = defen.replace(/(\d{3})$/, ',$1');
    this._node.find('.defen--' + f).text(menfeng[i] + ': ' + defen);
  }
  this._node.find('.defen.lunban').removeClass('lunban');
}

update(lunban) {
  var feng = ['zijia','xiajia','duimian','shangjia'];
  var f = feng[(this._chang.qijia + this._chang.jushu + lunban) % 4];
  this._node.find('.defen.lunban').removeClass('lunban');
  this._node.find('.defen--' + f).addClass('lunban');
}

}
