module.exports = class Game {

constructor() {
  this._chang = {
    menfeng: 0,
    jushu:   0,
    qijia:   Math.floor(Math.random() * 4),
    defen:  [ 0, 0, 0, 0 ]  // 仮親からの順
  };

  this._player = [ new Majiang.UI(0) ];     // 仮親は常にUI
  for (var i = 1; i < 4; i++) {
    this._player.push(new Majiang.Player(i));
  }
  this._reply = [];

  // TODO: Audio
  // Majiang.Audio.volume(2);
}

player(lunban) {
  return (this._chang.qijia + this._chang.jushu + lunban) % 4;
}

kaiju() {
  console.log('*** 開局 ***');  // for DEBUG

  this._model = {
    shan:  new Majiang.Shan(),
    he:    [],
    shoupai: [],
  };
  this._view = {
    chang:   new Majiang.View.Chang($('.chang'), this._chang),
    he:    [],
    shoupai: [],
  }
  this._lunban = 0;

  this._view.chang.redraw();

  var haipai = [ [], [], [], [] ];    // この局の東南西北の順
  for (var n = 0; n < 3; n++) {
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
        haipai[i].push(this._model.shan.zimo());
      }
    }
  }
  for (var i = 0; i < 4; i++) {
    haipai[i].push(this._model.shan.zimo());
  }

  var feng = ['zijia','xiajia','duimian','shangjia'];
  for (var i = 0; i < 4; i++) {       // この局の東南西北の順
    this._model.shoupai[i] = new Majiang.Shoupai(haipai[i]);
    this._model.he[i]    = new Majiang.He();

    var f = feng[this.player(i)];
    this._view.shoupai[i]
      = new Majiang.View.Shoupai(
          $('.shoupai--'+f), this._model.shoupai[i], f == 'zijia');
    this._view.he[i] = new Majiang.View.He($('.he--'+f), this._model.he[i]);

    this._view.shoupai[i].redraw();
    this._view.he[i].redraw();
  }

  for (var i = 0; i < 4; i++) {       // この局の東南西北の順
    var data = {
      chang: { /*** 実装要 ***/},
      zifeng: i,
      haipai: haipai[i]
    }
    this._player[this.player(i)].kaiju(data);
  }

  this.zimo();
}

zimo() {
  var zimo = this._model.shan.zimo();
  this._model.shoupai[this._lunban].zimo(zimo);

  this._view.chang.update(this._lunban);
  this._view.shoupai[this._lunban].redraw();

  var self = this;
  this._reply = [];
  this._player[this.player(this._lunban)].zimo(
    { lunban: self._lunban, zimo: zimo },
    function(id, type, data){self.reply_zimo(id, type, data)},
    1000
  );
}

dapai(dapai) {
  Majiang.Audio.play('dapai');

  this._model.shoupai[this._lunban].dapai(dapai);
  this._view.shoupai[this._lunban].redraw();
  this._model.he[this._lunban].dapai(dapai);
  this._view.he[this._lunban].dapai(dapai);

  var self = this;
  this._reply = [];
  for (var i = 0; i < 4; i++) {
    this._player[i].dapai(
      { lunban: self._lunban, dapai: dapai },
      function(id, type, data){self.reply_dapai(id, type, data)},
      0
    );
  }
}

fulou(data) {
  var f = data.match(/[\-\+\=]/)[0];

  this._model.he[this._lunban].fulou(f);
  this._view.he[this._lunban].redraw();

  var lunban = this._lunban;
  this._lunban = (f == '-') ? (this._lunban + 1) % 4
         : (f == '=') ? (this._lunban + 2) % 4
         : (f == '+') ? (this._lunban + 3) % 4
         :         this._lunban;
  this._view.chang.update(this._lunban);

  this._model.shoupai[this._lunban].fulou(data);
  this._view.shoupai[this._lunban].redraw();

  var self = this;
  this._reply = [];
  for (var i = 0; i < 4; i++) {
    this._player[i].fulou(
      { lunban: self._lunban, fulou: data },
      function(id, type, data){self.reply_fulou(id, type, data)},
      1000
    );
  }
}

liuju() {
  this._view.he[this._lunban].redraw();
  this.hule();
}

hule() {
  this._chang.jushu++;
  if (this._chang.jushu == 4) {
    this._chang.menfeng++;
    this._chang.jushu = 0;
  }
  if (this._chang.menfeng == 2) return;

  var self = this;
  setTimeout(function(){ self.kaiju() }, 5000);
}

reply_zimo(id, type, data) {
  console.log('[' + id +'] => (' + type + ', ' + data + ')');  // for DEBUG
  if    (type == 'dapai')   this.dapai(data)
  else if (type == 'hule')  this.hule()
}

reply_dapai(id, type, data) {
  console.log('[' + id +'] => (' + type + ', ' + data + ')');  // for DEBUG

  this._reply.push( { id: id, type: type, data: data } );
  if (this._reply.length < 4) return;

  for (var reply of this._reply) {  // 修正要(チョンボ、ダブロンの考慮なし)
    if (reply.type == 'hule') {
      this.hule();
      return;
    }
    if (reply.type == 'fulou') {
      this.fulou(data);
      return;
    }
  }

  if (this._model.shan.paishu() == 0) {
    this.liuju();
    return;
  }

  this._view.he[this._lunban].redraw();

  this._lunban = (this._lunban + 1) % 4;
  this._view.chang.update(this._lunban);

  this.zimo();
}

reply_fulou(id, type, data) {
  console.log('[' + id +'] => (' + type + ', ' + data + ')');  // for DEBUG
  if    (type == 'dapai')   this.dapai(data)
}

}
