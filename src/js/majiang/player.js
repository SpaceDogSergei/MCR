module.exports = class Player {

constructor(id) {
  this._id = id;
}

kaiju(data) {
}

zimo(data, callback, timeout) {
  console.log('[' + this._id +'] <= (zimo, ' + data.zimo + ')');  // for DEBUG
  var id = this._id;
  setTimeout(function(){ callback(id, 'dapai', data.zimo) }, timeout);
}

dapai(data, callback, timeout) {
  console.log('[' + this._id +'] <= (dapai, ' + data.dapai + ')');  // for DEBUG
  var id = this._id;
  setTimeout(function(){ callback(id, '') }, timeout);
}

fulou(data, callback, timeout) {
  console.log('[' + this._id +'] <= (fulou, ' + data.dapai + ')');  // for DEBUG
  var id = this._id;
  setTimeout(function(){ callback(id, '') }, timeout);
}

}
