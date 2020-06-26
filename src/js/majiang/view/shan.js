/*
 *  Majiang.View.Shan
 */
"use strict";

const $ = require('jquery');
const Majiang = { View: { pai: require('./pai') } };

module.exports = class Shan {

constructor(root, shan) {
  this._node = {
    paishu: $('.paishu', root)
  }
  this._shan = shan;
}

redraw() {
  this._node.paishu.text(this._shan.paishu());
  return this;
}

// update() {
//   this._node.paishu.text(this._shan.paishu());
//   return this;
// }

}
