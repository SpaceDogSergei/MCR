/*
 *  Majiang.Util.xiangting
 */
"use strict";

/**
 * @param {number} m 面子数
 * @param {number} d 搭子数
 * @param {number} g 孤立牌数
 * @param {boolean} j 是否有将牌
 *
 * @return {number} 一般和牌形向听数
 *
 * @example _xiangting(4, 0, 0, true) -> -1
 * @example _xiangting(4, 0, 0, false) -> 0
 * @example _xiangting(3, 2, 1, false) -> 1
 * @example _xiangting(2, 3, 0, true) -> 1
 **/
function _xiangting(m, d, g, j) {

  // 将牌以外的 block 上限
  let n = j ? 4 : 5;
  // 面子过多（可省略）
  if (m > 4) { d += m - 4; m = 4 }
  // 搭子过多
  if (m + d > 4) { g += (m + d - 4) * 2; d = 4 - m }
  // 实际可用的孤立牌
  if (m + d + g > n) { g = n - m - d }
  // 将牌也算搭子
  if (j) d++;

  return 13 - m * 3 - d * 2 - g;
}

/**
 * @param {Majiang.Shoupai} bingpai 单个花色的兵牌
 *
 * @return {Object{a: [array], b:[array]} 一般和牌形搭子的分割。a: 使(面子数 × 2 ＋ 搭子数)最大的分割，b: 使面子数最大的分割
 * 数组各个元素依次表示面子数、搭子数和孤立牌数
 *
 * @example dazi([0, 1, 3, 1, 1, 1, 0, 0, 0, 0]) -> { a: [0, 3, 1], b: [0, 3, 1] }
 **/
function dazi(bingpai) {

  let n_pai = 0, n_dazi = 0, n_guli = 0;

  for (let n = 1; n <= 9; n++) {
    n_pai += bingpai[n];
    if (n <= 7 && bingpai[n+1] == 0 && bingpai[n+2] == 0) {
      n_dazi += n_pai >> 1;
      n_guli += n_pai  % 2;
      n_pai = 0;
    }
  }
  n_dazi += n_pai >> 1;
  n_guli += n_pai  % 2;

  return { a: [ 0, n_dazi, n_guli ],
       b: [ 0, n_dazi, n_guli ] };
}

/**
 * @param {Majiang.Shoupai} bingpai 单个花色的兵牌
 * @param {number} n 回溯法位置
 *
 * @return {Object{a: [array], b:[array]} 一般和牌形搭子的分割。a: 使(面子数 × 2 ＋ 搭子数)最大的分割，b: 使面子数最大的分割
 * 数组各个元素依次表示面子数、搭子数和孤立牌数
 *
 * @example mianzi([0, 1, 3, 1, 1, 1, 0, 0, 0, 0]) -> { a: [1, 2, 0], b: [2, 0, 1] }
 **/
function mianzi(bingpai, n = 1) {

  if (n > 9) return dazi(bingpai);

  let max = mianzi(bingpai, n+1);

  if (n <= 7 && bingpai[n] > 0 && bingpai[n+1] > 0 && bingpai[n+2] > 0) {
    bingpai[n]--; bingpai[n+1]--; bingpai[n+2]--;
    let r = mianzi(bingpai, n);
    bingpai[n]++; bingpai[n+1]++; bingpai[n+2]++;
    r.a[0]++; r.b[0]++;
    if (r.a[0]* 2 + r.a[1] > max.a[0]* 2 + max.a[1]) max.a = r.a;
    if (r.b[0]*10 + r.b[1] > max.b[0]*10 + max.b[1]) max.b = r.b;
  }

  if (bingpai[n] >= 3) {
    bingpai[n] -= 3;
    let r = mianzi(bingpai, n);
    bingpai[n] += 3;
    r.a[0]++; r.b[0]++;
    if (r.a[0]* 2 + r.a[1] > max.a[0]* 2 + max.a[1]) max.a = r.a;
    if (r.b[0]*10 + r.b[1] > max.b[0]*10 + max.b[1]) max.b = r.b;
  }

  return max;
}

/**
 * @param {Majiang.Shoupai} shoupai 手牌（不含将牌）
 * @param {boolean} jiangpai 是否有将牌
 *
 * @return {number} 一般和牌形的最小向听数
 *
 * @example mianzi_all(Majiang.Shoupai.fromString('m133345568z236'), true) -> 2
 **/
function mianzi_all(shoupai, jiangpai) {

  let r = {
    m: mianzi(shoupai._bingpai.m),
    p: mianzi(shoupai._bingpai.p),
    s: mianzi(shoupai._bingpai.s),
  };

  let z = [0, 0, 0];
  for (let n = 1; n <= 7; n++) {
    if    (shoupai._bingpai.z[n] >= 3) z[0]++;
    else if (shoupai._bingpai.z[n] == 2) z[1]++;
    else if (shoupai._bingpai.z[n] == 1) z[2]++;
  }

  let n_fulou = shoupai._fulou.length;

  let min = 13;

  for (let m of [r.m.a, r.m.b]) {
    for (let p of [r.p.a, r.p.b]) {
      for (let s of [r.s.a, r.s.b]) {
        let x = [n_fulou, 0, 0];
        for (let i = 0; i < 3; i++) {
          x[i] += m[i] + p[i] + s[i] + z[i];
        }
        let n_xiangting = _xiangting(x[0], x[1], x[2], jiangpai);
        if (n_xiangting < min) min = n_xiangting;
      }
    }
  }

  return min;
}

/**
 * @param {Majiang.Shoupai} shoupai 手牌
 *
 * @return {number} 一般和牌形的最小向听数
 *
 * @example xiangting_yiban(Majiang.Shoupai.fromString('m133345568z23556')) -> 2
 **/
function xiangting_yiban(shoupai) {

  let min = mianzi_all(shoupai);

  for (let s of ['m', 'p', 's', 'z']) {
    let bingpai = shoupai._bingpai[s];
    for (let n = 1; n < bingpai.length; n++) {
      if (bingpai[n] >= 2) {
        bingpai[n] -= 2;
        let n_xiangting = mianzi_all(shoupai, true);
        bingpai[n] += 2;
        if (n_xiangting < min) min = n_xiangting;
      }
    }
  }
  if (min == -1 && shoupai._zimo && shoupai._zimo.length > 2) return 0;

  return min;
}

/**
 * @param {Majiang.Shoupai} shoupai 手牌
 *
 * @return {number} 十三幺和牌形的最小向听数
 *
 * @example xiangting_shisanyao(Majiang.Shoupai.fromString('m133345568z23556')) -> 7
 **/
function xiangting_shisanyao(shoupai) {

  if (shoupai._fulou.length) return Infinity;

  let n_yaojiu = 0;
  let n_duizi  = 0;

  for (let s of ['m', 'p', 's', 'z']) {
    let bingpai = shoupai._bingpai[s];
    let nn = (s == 'z') ? [1,2,3,4,5,6,7] : [1,9];
    for (let n of nn) {
      if (bingpai[n] >= 1) n_yaojiu++;
      if (bingpai[n] >= 2) n_duizi++;
    }
  }

  return n_duizi ? 12 - n_yaojiu : 13 - n_yaojiu;
}

/**
 * @param {Majiang.Shoupai} shoupai 手牌
 *
 * @return {number} 七对和牌形的最小向听数
 *
 * @example xiangting_qidui(Majiang.Shoupai.fromString('m3333556688z235')) -> 1
 **/
function xiangting_qidui(shoupai) {

  if (shoupai._fulou.length) return Infinity;

  let n_duizi = 0;
  let n_guli  = 0;

  for (let s of ['m', 'p', 's', 'z']) {
    let bingpai = shoupai._bingpai[s];
    for (let n = 1; n < bingpai.length; n++) {
      n_duizi += Math.floor(bingpai[n] / 2);
      n_guli += bingpai[n] % 2;
    }
  }

  if (n_duizi > 7) n_duizi = 7;
  if (n_duizi + n_guli > 7) n_guli  = 7 - n_duizi;

  return 13 - n_duizi * 2 - n_guli;
}

/**
 * @param {Majiang.Shoupai} shoupai 手牌
 *
 * @return {number} 所有和牌形的最小向听数
 *
 * @example xiangting_qidui(Majiang.Shoupai.fromString('m3333556688z235')) -> 1
 **/
function xiangting(shoupai) {
  return Math.min(
    xiangting_yiban(shoupai),
    xiangting_shisanyao(shoupai),
    xiangting_qidui(shoupai)
  );
}

/**
 * @param {Majiang.Shoupai} shoupai 13 张手牌
 *
 * @return {array} （能减少向听数的）有效牌
 *
 * @example tingpai(Majiang.Shoupai.fromString('m22p11223s567788')) -> ["m2", "p3", "s5", "s6", "s8", "s9"]
 **/
function tingpai(shoupai, f_xiangting = xiangting) {

  if (shoupai._zimo) throw new Error(shoupai);

  let pai = [];
  let n_xiangting = f_xiangting(shoupai);
  for (let s of ['m', 'p', 's', 'z']) {
    let bingpai = shoupai._bingpai[s];
    for (let n = 1; n < bingpai.length; n++) {
      if (bingpai[n] >= 4) continue;
      bingpai[n]++;
      if (f_xiangting(shoupai) < n_xiangting) pai.push(s+n);
      bingpai[n]--;
    }
  }
  return pai;
}

module.exports = {
  xiangting_shisanyao: xiangting_shisanyao,
  xiangting_qidui:  xiangting_qidui,
  xiangting_yiban:  xiangting_yiban,
  xiangting:    xiangting,
  tingpai:      tingpai
}
