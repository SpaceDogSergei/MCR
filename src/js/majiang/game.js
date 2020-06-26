/*
 *  Majiang.Game
 */
"use strict";

const Majiang = {
  Shan: require('./shan'),
  Shoupai: require('./shoupai'),
  He: require('./he'),
  Util: require('./util')
};

module.exports = class Game {

constructor() {
  this._model = {
    title: new Date().toLocaleString(),
    // TODO: i18n
    player: ['私', '下家', '対面', '上家'],
    qijia: Math.floor(Math.random() * 4),
    quanfeng: 0,
    jushu: 0,
    defen: [0, 0, 0, 0],
    shan: null,
    shoupai: [],
    he: [],
    player_id: [0, 1, 2, 3],
  };

  this._player = [];

  // TODO: 顺位点
  // this._ranking_point = [90, 10, -30, -70];

  this._reply = [];

  this._speed = 3;
  this._stop  = false;
  this._delay = 0;
}

stop() {
  this._stop = true;
  this._timeout_id = clearTimeout(this._timeout_id);
}

start() {
  this._stop = false;
  if (!this._timeout_id) this._timeout_id = setTimeout(() => this.next(), 0);
}

delay(callback, timeout) {
  timeout = this._speed == 0 ? 0
      : timeout == null ? Math.max(500, this._speed * 200)
      : timeout
  setTimeout(callback, timeout);
}

notify_players(type, msg) {
  for (let l = 0; l < 4; l++) {
    setTimeout(() => {
      this._player[this._model.player_id[l]].action(msg[l]);
    }, 0);
  }
}

call_players(type, msg, timeout) {
  timeout = (!this._speed || timeout == null) ? this._speed * 200 : timeout;

  this._status = type;
  this._reply = [];
  for (let l = 0; l < 4; l++) {
    let id = this._model.player_id[l];
    setTimeout(() => {
      this._player[id].action(
        msg[l],
        reply => this.reply(id, reply)
      );
    }, 0);
  }
  this._timeout_id = setTimeout(() => this.next(), timeout);
}

reply(id, reply = {}) {
  this._reply[id] = reply;
  if (this._reply.filter(x => x).length < 4) return;
  if (!this._timeout_id) this._timeout_id = setTimeout(() => this.next(), 0);
}

add_paipu(paipu) {
  this._paipu.log[this._paipu.log.length - 1].push(paipu);
}

kaiju() {
  if (this._view) this._view.kaiju();

  this._paipu = {
    title: this._model.title,
    player: this._model.player.concat(),
    qijia: this._model.qijia,
    log: [],
    defen: this._model.defen.concat(),
    point: [0, 0, 0, 0],
    rank: [1, 2, 3, 4],
  };

  this._status = null;

  let msg = [];
  for (let id = 0; id < 4; id++) {
    msg[id] = JSON.parse(JSON.stringify({
      kaiju: {
        player: this._paipu.player,
        qijia: this._paipu.qijia,
        hongpai: this._hongpai
      }
    }));
  }
  this.notify_players('kaiju', msg);

  if (!this._stop) this.qipai();
}

qipai(shan) {
  let model = this._model;

  model.shan = shan || new Majiang.Shan();
  let qipai = [ [], [], [], [] ];
  for (let l = 0; l < 4; l++) {
    for (let i = 0; i < 13; i++) {
      qipai[l].push(model.shan.zimo());
    }
    model.shoupai[l] = new Majiang.Shoupai(qipai[l]);
    model.he[l] = new Majiang.He();
    model.player_id[l] = (model.qijia + model.jushu + l) % 4;
  }
  model.lunban = -1;

  this._dapai = null;
  this._gang = null;

  this._n_gang = [0, 0, 0, 0];
  this._neng_rong = [1, 1, 1, 1];
  this._hule = [];

  this._paipu.defen = model.defen.concat();
  this._paipu.log.push([]);
  let paipu = {
    qipai: {
      quanfeng: model.quanfeng,
      jushu: model.jushu,
      defen: model.player_id.map(id => model.defen[id]),
      shoupai: model.shoupai.map(s => s.toString())
    }
  };
  this.add_paipu(paipu);

  let msg = [];
  for (let l = 0; l < 4; l++) {
    msg[l] = JSON.parse(JSON.stringify(paipu));
    for (let i = 0; i < 4; i++) {
      if (i != l) msg[l].qipai.shoupai[i] = '';
    }
  }
  this.notify_players('qipai', msg);

  if (this._view) this._view.redraw();

  if (!this._stop) this.zimo();
}

zimo() {
  let model = this._model;

  if (model.shan.paishu() == 0) {
    this.delay(() => this.liuju(), 0);
    return;
  }

  model.lunban = (model.lunban + 1) % 4;

  let zimo = model.shan.zimo();
  model.shoupai[model.lunban].zimo(zimo);

  let paipu = { zimo: { l: model.lunban, p: zimo } };
  this.add_paipu(paipu);

  let msg = [];
  for (let l = 0; l < 4; l++) {
    msg[l] = JSON.parse(JSON.stringify(paipu));
    if (l != model.lunban) msg[l].zimo.p = '';
  }
  this.call_players('zimo', msg);

  if (this._view) this._view.update(paipu);
}

dapai(dapai) {
  let model = this._model;

  // if (!model.shoupai[model.lunban].lizhi())
  //                   this._neng_rong[model.lunban] = true;

  model.shoupai[model.lunban].dapai(dapai);
  model.he[model.lunban].dapai(dapai);

  this._dapai = dapai;

  // if (Majiang.Util.xiangting(model.shoupai[model.lunban]) == 0
  //   && Majiang.Util.tingpai(model.shoupai[model.lunban])
  //                 .find(p => model.he[model.lunban].find(p)))
  // {
  //   this._neng_rong[model.lunban] = false;
  // }

  let paipu = { dapai: { l: model.lunban, p: dapai } };
  this.add_paipu(paipu);

  if (this._gang) this.kaigang();

  let msg = [];
  for (let l = 0; l < 4; l++) {
    msg[l] = JSON.parse(JSON.stringify(paipu));
  }
  this.call_players('dapai', msg);

  if (this._view) this._view.update(paipu);
}

fulou(fulou) {
  let model = this._model;

  let d = fulou.match(/[\-\=\+]/)[0];
  model.he[model.lunban].fulou(d);

  model.lunban = (model.lunban + { '-': 1, '=': 2, '+': 3 }[d]) % 4;
  model.shoupai[model.lunban].fulou(fulou);

  if (fulou.match(/^[mpsz]\d{4}/)) {
    this._gang = fulou;
    this._n_gang[model.lunban]++;
  }

  let paipu = { fulou: { l: model.lunban, m: fulou } };
  this.add_paipu(paipu);

  let msg = [];
  for (let l = 0; l < 4; l++) {
    msg[l] = JSON.parse(JSON.stringify(paipu));
  }
  this.call_players('fulou', msg);

  if (this._view) this._view.update(paipu);
}

gang(gang) {
  let model = this._model;

  let p = (gang.match(/^[mpsz]\d{4}$/))
        ? gang.substr(0, 2)
        : gang[0] + gang.substr(-1)
  model.shoupai[model.lunban].gang(p);

  this._n_gang[model.lunban]++;

  let paipu = { gang: { l: model.lunban, m: gang } };
  this.add_paipu(paipu);

  if (this._gang) this.kaigang();

  this._gang = gang;

  let msg = [];
  for (let l = 0; l < 4; l++) {
    msg[l] = JSON.parse(JSON.stringify(paipu));
  }
  this.call_players('gang', msg);

  if (this._view) this._view.update(paipu);
}

gangzimo() {
  let model = this._model;

  let zimo = model.shan.gangzimo();
  model.shoupai[model.lunban].zimo(zimo);

  let paipu = { gangzimo: { l: model.lunban, p: zimo } };
  this.add_paipu(paipu);

  if (this._gang.match(/^[mpsz]\d{4}$/)) this.kaigang();

  let msg = [];
  for (let l = 0; l < 4; l++) {
    msg[l] = JSON.parse(JSON.stringify(paipu));
    if (l != model.lunban) msg[l].gangzimo.p = '';
  }
  this.call_players('gangzimo', msg);

  if (this._view) this._view.update(paipu);
}

kaigang() {
  let model = this._model;

  this._gang = null;

  model.shan.kaigang();
  let baopai = model.shan.baopai().pop();

  // TODO: ???
  let paipu = { kaigang: { baopai: baopai } };
  this.add_paipu(paipu);

  let msg = [];
  for (let l = 0; l < 4; l++) {
    msg[l] = JSON.parse(JSON.stringify(paipu));
  }
  this.notify_players('kaigang', msg);

  if (this._view) this._view.update(paipu);
}

hule() {
  let model = this._model;

  this._no_game = false;

  if (this._status != 'hule') {
    this._hule_option = this._status == 'gang' ? 'qianggang'
              : this._status == 'gangzimo' ? 'gangkai'
              : null;
  }

  let menfeng = (this._hule.length) ? this._hule.shift() : model.lunban;
  let rongpai;
  if (menfeng != model.lunban) {
    rongpai = (this._hule_option == 'qianggang'
            ? this._gang[0] + this._gang.substr(-1)
            : this._dapai.substr(0, 2)         )
        + ['', '+', '=', '-'][(4 + model.lunban - menfeng) % 4];
  }
  let shoupai  = model.shoupai[menfeng].clone();
  if (rongpai) shoupai.zimo(rongpai);

  let param = {
    quanfeng: model.quanfeng,
    menfeng: menfeng,
    hupai: {
      qianggang: this._hule_option == 'qianggang',
      gangkai: this._hule_option == 'gangkai',
      haidi: model.shan.paishu() > 0 ? 0
             : !rongpai ? 1
             : 2,
    },
  };
  let hule = Majiang.Util.hule(shoupai, rongpai, param);

  this._fenpei = hule.fenpei;

  let paipu = {
    hule: {
      l: menfeng,
      shoupai: shoupai.toString(),
      defen: hule.defen,
      hupai: hule.hupai,
      fenpei: hule.fenpei
    }
  };
  // TODO: enough?
  paipu.hule.fanshu = hule.fanshu;
  this.add_paipu(paipu);

  let msg = [];
  for (let l = 0; l < 4; l++) {
    msg[l] = JSON.parse(JSON.stringify(paipu));
  }
  this.call_players('hule', msg, this._delay);

  if (this._view) this._view.update(paipu);
}

liuju(name) {
  let model = this._model;

  let shoupai = ['', '', '', ''];
  let fenpei  = [0, 0, 0, 0];

  this._fenpei = fenpei;

  let paipu = { liuju: { shoupai: shoupai, fenpei: fenpei } };

  this.add_paipu(paipu);

  let msg = [];
  for (let l = 0; l < 4; l++) {
    msg[l] = JSON.parse(JSON.stringify(paipu));
  }
  this.call_players('liuju', msg, this._delay);

  if (this._view) this._view.update(paipu);
}

last() {
  let model = this._model;

  model.lunban = -1;
  if (this._view) this._view.update();

  model.jushu++;
  model.quanfeng += Math.floor(model.jushu / 4);
  model.jushu = model.jushu % 4;

  let jieju = false;
  let guanjun;
  const defen = model.defen;
  for (let i = 0; i < 4; i++) {
    let id = (model.qijia + i) % 4;
    if (guanjun == null || defen[id] > defen[guanjun]) guanjun = id;
  }

  // TODO: 半庄 == 2
  if (model.quanfeng == 4) jieju = true;

  if (jieju) this.delay(() => this.jieju(), 0);
  else this.delay(() => this.qipai(), 0);
}

jieju() {
  let model = this._model;

  let paiming = [];
  const defen = model.defen;
  for (let i = 0; i < 4; i++) {
    let id = (model.qijia + i) % 4;
    for (let j = 0; j < 4; j++) {
      if (j == paiming.length || defen[id] > defen[paiming[j]]) {
        paiming.splice(j, 0, id);
        break;
      }
    }
  }

  let rank = [0, 0, 0, 0];
  for (let i = 0; i < 4; i++) {
    rank[paiming[i]] = i + 1;
  }

  let point = [0, 0, 0, 0];
  for (let i = 0; i < 4; i++) {
    let id = paiming[i];
    point[id] = defen[id];
    // TODO: 顺位点
    // point[id] = defen[id] + this._ranking_point[i];
  }

  let table_point = [0, 0, 0, 0];
  let table_point_fenpei = [4, 2, 1, 0];
  for (let i = 1; i < 4; i++) {
    table_point[paiming[i]] = table_point_fenpei[i];
  }

  this._paipu.defen = defen.concat();
  this._paipu.rank  = rank.concat();
  this._paipu.point = point.concat();

  let paipu = { jieju: { defen: defen, rank: rank,
                         point: point, table_point: table_point } };
  let msg = [];
  for (let l = 0; l < 4; l++) {
    msg[l] = JSON.parse(JSON.stringify(paipu));
  }
  this.call_players('jieju', msg, this._delay);

  if (this._view) this._view.summary(this._paipu);

  if (this._jieju_handler) this._jieju_handler();
}

next(force) {
  this._timeout_id = clearTimeout(this._timeout_id);
  if (this._reply.filter(x => x).length < 4) return;
  if (!force && this._stop) return;

  if (this._status == 'zimo') this.reply_zimo();
  else if (this._status == 'dapai') this.reply_dapai();
  else if (this._status == 'fulou') this.reply_fulou();
  else if (this._status == 'gang') this.reply_gang();
  else if (this._status == 'gangzimo') this.reply_zimo();
  else if (this._status == 'hule') this.reply_hule();
  else if (this._status == 'liuju') this.reply_liuju();
  else if (this._status == 'jieju') this.reply_jieju();
}

reply_zimo() {
  let model = this._model;

  let reply = this._reply[model.player_id[model.lunban]];
  if (reply.hule) {
    if (this.allow_hule()) {
      if (this._view) this._view.say('zimo', model.lunban);
      this.delay(() => this.hule());
      return;
    }
  }
  else if (reply.gang) {
    if (this.get_gang_mianzi().find(m => m == reply.gang)) {
      if (this._view) this._view.say('gang', model.lunban);
      this.delay(() => this.gang(reply.gang));
      return;
    }
  }
  else if (reply.dapai) {
    if (this.get_dapai().find(p => p == reply.dapai)) {
      this.delay(() => this.dapai(reply.dapai), 0);
      return;
    }
  }

  let p = this.get_dapai().pop();
  this.delay(() => this.dapai(p), 0);
}

reply_dapai() {
  let model = this._model;

  for (let i = 1; i < 4; i++) {
    let l = (model.lunban + i) % 4;
    let reply = this._reply[model.player_id[l]];
    if (reply.hule && this.allow_hule(l)) {
      if (this._view) this._view.say('hu', l);
      this._hule.push(l);
    }
    else {
      let shoupai = model.shoupai[l].clone().zimo(this._dapai);
      if (Majiang.Util.xiangting(shoupai) == -1)
                    this._neng_rong[l] = false;
    }
  }
  if (this._hule.length) {
    this.delay(() => this.hule());
    return;
  }

  for (let i = 1; i < 4; i++) {
    let l = (model.lunban + i) % 4;
    let reply = this._reply[model.player_id[l]];
    if (reply.fulou) {
      let m = reply.fulou;
      if (m.match(/^[mpsz](\d)\1\1\1/)) {
        if (this.get_gang_mianzi(l).find(m => reply.fulou)) {
          if (this._view) this._view.say('gang', l);
          this.delay(() => this.fulou(reply.fulou));
          return;
        }
      }
      else if (m.match(/^[mpsz](\d)\1\1/)) {
        if (this.get_peng_mianzi(l).find(m => reply.fulou)) {
          if (this._view) this._view.say('peng', l);
          this.delay(() => this.fulou(reply.fulou));
          return;
        }
      }
    }
  }
  let l = (model.lunban + 1) % 4;
  let reply = this._reply[model.player_id[l]];
  if (reply.fulou) {
    if (this.get_chi_mianzi(l).find(m => reply.fulou)) {
      if (this._view) this._view.say('chi', l);
      this.delay(() => this.fulou(reply.fulou));
      return;
    }
  }

  this.delay(() => this.zimo(), 0);
}

reply_fulou() {
  let model = this._model;

  if (this._gang) {
    this.delay(() => this.gangzimo(), 0);
    return;
  }

  let reply = this._reply[model.player_id[model.lunban]];
  if (reply.dapai) {
    if (this.get_dapai().find(p => p == reply.dapai)) {
      this.delay(() => this.dapai(reply.dapai), 0);
      return;
    }
  }

  let p = this.get_dapai().pop();
  this.delay(() => this.dapai(p), 0);
}

reply_gang() {
  let model = this._model;

  if (this._gang.match(/^[mpsz]\d{4}$/)) {
    this.delay(() => this.gangzimo(), 0);
    return;
  }

  for (let i = 1; i < 4; i++) {
    let l = (model.lunban + i) % 4;
    let reply = this._reply[model.player_id[l]];
    if (reply.hule && this.allow_hule(l)) {
      if (this._view) this._view.say('hu', l);
      this._hule.push(l);
    }
    else {
      let shoupai = model.shoupai[l].clone().zimo(this._gang.substr(0, 2));
      if (Majiang.Util.xiangting(shoupai) == -1)
                    this._neng_rong[l] = false;
    }
  }
  if (this._hule.length) {
    this.delay(() => this.hule());
    return;
  }

  this.delay(() => this.gangzimo(), 0);
}

reply_hule() {
  let model = this._model;

  for (let l = 0; l < 4; l++) {
    model.defen[model.player_id[l]] += this._fenpei[l];
  }

  if (this._hule.length) {
    this.delay(() => this.hule());
  }
  else {
    this.delay(() => this.last(), 0);
  }
}

reply_liuju() {
  let model = this._model;

  for (let l = 0; l < 4; l++) {
    model.defen[model.player_id[l]] += this._fenpei[l];
  }

  this.delay(() => this.last(), 0);
}

reply_jieju() {
  if (this._callback) this._callback();
}

get_dapai() {
  let model = this._model;
  return Game.get_dapai(model.shoupai[model.lunban]);
}

get_chi_mianzi(l) {
  let model = this._model;
  let p = this._dapai.substr(0, 2)
      + ['', '+', '=', '-'][(4 + model.lunban - l) % 4];
  return Game.get_chi_mianzi(model.shoupai[l], p, model.shan.paishu());
}

get_peng_mianzi(l) {
  let model = this._model;
  let p = this._dapai.substr(0, 2)
      + ['', '+', '=', '-'][(4 + model.lunban - l) % 4];
  return Game.get_peng_mianzi(model.shoupai[l], p, model.shan.paishu());
}

get_gang_mianzi(l) {
  let model = this._model;
  if (l != null) {
    let p = this._dapai.substr(0, 2)
        + ['', '+', '=', '-'][(4 + model.lunban - l) % 4];
    return Game.get_gang_mianzi(model.shoupai[l], p, model.shan.paishu());
  }
  else {
    return Game.get_gang_mianzi(model.shoupai[model.lunban], null,
                  model.shan.paishu());
  }
}

/**
 * @param {number} l 点炮者（null 为自摸）
 *
 * @return {boolean} 能否和牌
 **/
allow_hule(l) {
  let model = this._model;
  if (l != null) {
    let p = (this._status == 'gang' ? this._gang[0] + this._gang.substr(-1)
                    : this._dapai.substr(0, 2))
        + ['', '+', '=', '-'][(4 + model.lunban - l) % 4];
    // TODO: ???
    let hupai = this._status == 'gang'
          || model.shan.paishu() == 0;
    return Game.allow_hule(model.shoupai[l], p, model.quanfeng, l,
                 hupai, this._neng_rong[l]);
  }
  else {
    // TODO: ???
    let hupai = this._status == 'gangzimo'
          || model.shan.paishu() == 0;
    return Game.allow_hule(model.shoupai[model.lunban], null,
                 model.quanfeng, model.lunban, hupai);
  }
}

static get_dapai(shoupai) {
  if (!shoupai._zimo) return [];

  let dapai = shoupai.get_dapai();
  if (shoupai._zimo.length > 2) return dapai;

  let [s, n] = shoupai._zimo;
  if (shoupai._shouli[s][n] == 1)
    dapai.splice(dapai.indexOf(shoupai._zimo), 1);
  return dapai.concat(shoupai._zimo + '_');
}

static get_chi_mianzi(shoupai, p, paishu) {
  if (shoupai._zimo) return [];

  if (!paishu) return [];

  return shoupai.get_chi_mianzi(p);
}

static get_peng_mianzi(shoupai, p, paishu) {
  if (shoupai._zimo) return [];

  if (!paishu) return [];

  return shoupai.get_peng_mianzi(p);
}

static get_gang_mianzi(shoupai, p, paishu) {
  if (!paishu) return [];

  if (p) {
    if (shoupai._zimo) return [];
    return shoupai.get_gang_mianzi(p);
  }
  else {
    if (!shoupai._zimo) return [];
    if (shoupai._zimo.length > 2) return [];

    return shoupai.get_gang_mianzi();
  }
}

static allow_hule(shoupai, p, quanfeng, menfeng, hupai, neng_rong) {
  if (p && !neng_rong) return false;

  let new_shoupai = shoupai.clone();
  if (p) new_shoupai.zimo(p);
  if (Majiang.Util.xiangting(new_shoupai) != -1) return false;

  if (hupai) return true;

  let param = {
    quanfeng: quanfeng,
    menfeng: menfeng,
    hupai: {},
  };
  let hule = Majiang.Util.hule(new_shoupai, p, param);

  return hule.hupai != null;
}

}
