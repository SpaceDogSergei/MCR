module.exports = class UI {

constructor(id) {
  this._id = id;
  $('.UI__button').hide();
}

static get_chi_mianzi(shoupai, dapai) {
    var s = dapai[0];
    var n = dapai[1] - 1;
    var pai = shoupai._shouli[s];
    var chi_mianzi = [];
    if (s == 'z') return chi_mianzi;
    if (n > 1 && pai[n-2] > 0 && pai[n-1] > 0) {
        chi_mianzi.push(s + (n-1) + n + (n+1) + '-');
    }
    if (n < 7 && pai[n+1] > 0 && pai[n+2] > 0) {
        chi_mianzi.push(s + (n+1) + '-' + (n+2) + (n+3));
    }
    if (n > 0 && n < 8 && pai[n-1] > 0 && pai[n+1] > 0) {
        chi_mianzi.push(s + n + (n+1) + '-' + (n+2));
    }
    return chi_mianzi;
}

static set_chi_event(chi_mianzi, id, callback) {
  function handler(event) {
    var fulou = event.data;
    var s = fulou[0];
    var nn = fulou.match(/\d(?!\-)/g);
    var node = $('.shoupai--zijia .shouli');
    var img;
    if ($(this).data('pai') == s+nn[0])
            img = node.find('.pai[data-pai="'+s+nn[1]+'"]').eq(0);
    else    img = node.find('.pai[data-pai="'+s+nn[0]+'"]').eq(-1);
    node.find('.pai').removeClass('pai--selected').removeClass('dapai');
    $(this).addClass('pai--selected');
    img.addClass('pai--selected');
  }

  var pai = {};
  for (var fulou of chi_mianzi) {
    if (fulou == null) continue;
    var s = fulou[0];
    for (var n of fulou.match(/\d(?!\-)/g)) {
      pai[s+n] = fulou;
    }
  }
  for (var p in pai) {
    $('.pai--zijiaShouli[data-pai="'+p+'"]')
      .addClass('dapai')
      .bind('mouseover', pai[p], handler)
      .bind('click', pai[p], function(event){
        callback(id, 'fulou', event.data);
      });
  }
}

kaiju(data) {
  this._zifeng = data.zifeng;
  this._shoupai = new Majiang.Shoupai(data.haipai);
}

zimo(data, callback, timeout) {
  console.log('[' + this._id +'] <= (zimo, ' + data.zimo + ')');  // for DEBUG
  $('.UI').width($('.shoupai--zijia .shouli').width());
  var id = this._id;
  this._shoupai.zimo(data.zimo);
  if (Majiang.Util.xiangting(this._shoupai) == -1) {
    $('.UI__button--hu').bind('click', function(){
      $('.UI__button').hide();
      $('.pai--zijiaShouli').unbind('click');
      Majiang.Audio.play('hu');
      callback(id, 'hule')
      return false;
    }).show();
  }
  var self = this;
  $('.pai--zijiaShouli').each(function(){
    var dapai = $(this).data('pai');
    $(this).bind('click', dapai, function(event){
      $('.UI__button').hide();
      $('.pai--zijiaShouli').unbind('click');
      self._shoupai.dapai(dapai);
      callback(id, 'dapai', event.data);
      return false;
    });
  });
}

dapai(data, callback, timeout) {
  console.log('[' + this._id +'] <= (dapai, ' + data.dapai + ')');  // for DEBUG
  $('.UI').width($('.shoupai--zijia .shouli').width());
  var id = this._id;
  if (data.lunban == this._zifeng) {
    setTimeout(function(){ callback(id, '') }, timeout);
    return;
  }
  var action = false;
  // ロンできるかチェックする。修正要(役あり、フリテンなし)
  this._shoupai._shouli[data.dapai[0]][data.dapai[1]-1]++;
  var xiangting = Majiang.Util.xiangting(this._shoupai);
  this._shoupai._shouli[data.dapai[0]][data.dapai[1]-1]--;
  if (xiangting == -1) {
    $('.UI__button--hu').bind('click', function(){
      $('.pai--zijiaShouli').unbind('click');
      $('body').unbind('click');
      $('.UI__button').unbind('click');
      $('.UI__button').hide();
      Majiang.Audio.play('hu');
      callback(id, 'hule');
      return false;
    }).show();
    action = true;
  }
  // ポンできるかチェックする。後で共通化する。
  if (this._shoupai._shouli[data.dapai[0]][data.dapai[1]-1] >= 2) {
    var f = [null, '+', '=', '-']
    var mianzi
      = data.dapai[0] + data.dapai[1] + data.dapai[1] + data.dapai[1]
      + f[(4 + data.lunban - this._zifeng) % 4];
    $('.UI__button--peng').bind('click', mianzi, function(event){
      $('.pai--zijiaShouli').unbind('click');
      $('body').unbind('click');
      $('.UI__button').unbind('click');
      $('.UI__button').hide();
      Majiang.Audio.play('peng');
      callback(id, 'fulou', event.data);
      return false;
    }).show();
    action = true;
  }
  // チーできるかチェックする。後で共通化する。
  if ((data.lunban + 1) % 4 == this._zifeng) {
    var chi_mianzi = UI.get_chi_mianzi(this._shoupai, data.dapai);
    if (chi_mianzi.length == 1) {
      $('.UI__button--chi').bind('click', function(){
        $('.pai--zijiaShouli').unbind('click');
        $('body').unbind('click');
        $('.UI__button').unbind('click');
        $('.UI__button').hide();
        Majiang.Audio.play('chi');
        callback(id, 'fulou', chi_mianzi[0]);
        return false;
      }).show();
      action = true;
    }
    if (chi_mianzi.length > 1) {
      $('.UI__button--chi').bind('click', function(){
        $('.pai--zijiaShouli').unbind('click');
        $('body').unbind('click');
        $('.UI__button').unbind('click');
        $('.UI__button').hide();
        Majiang.Audio.play('chi');
        UI.set_chi_event(chi_mianzi, id, callback);
        return false;
      }).show();
      action = true;
    }
  }
  if (action) {
    $('body').bind('click', function(){
      $('body').unbind('click');
      $('.UI__button').unbind('click');
      $('.UI__button').hide();
      callback(id, '');
      return false;
    });
  }
  else setTimeout(function(){ callback(id, '') }, timeout);
}

fulou(data, callback, timeout) {
  console.log('[' + this._id +'] <= (fulou, ' + data.dapai + ')');  // for DEBUG
  $('.UI').width($('.shoupai--zijia .shouli').width());
  var id = this._id;
  if (data.lunban != this._zifeng) {
    setTimeout(function(){ callback(id, '') }, timeout);
    return;
  }
  this._shoupai.fulou(data.fulou);
  var self = this;
  $('.pai--zijiaShouli').each(function(){
    var dapai = $(this).data('pai');
    $(this).bind('click', dapai, function(event){
      $('.UI__button').hide();
      $('.pai--zijiaShouli').unbind('click');
      self._shoupai.dapai(dapai);
      callback(id, 'dapai', event.data);
      return false;
    });
  });
}

}
