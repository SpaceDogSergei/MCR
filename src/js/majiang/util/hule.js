// function dazi(pai) {
//   var n_pai = 0;
//   var n_dazi = 0;
//
//   for (var i = 0; i < 9; i++) {
//     n_pai += pai[i];
//     if (i < 7 && pai[i+1] == 0 && pai[i+2] == 0) {
//       n_dazi += Math.floor(n_pai / 2);
//       n_pai = 0;
//     }
//   }
//   n_dazi += Math.floor(n_pai / 2);
//
//   return n_dazi;
// }
//
// function mianzi(pai, n) {
//
//   if (n == 9) {
//     var n_dazi = dazi(pai);
//     return [[0, n_dazi], [0, n_dazi]];
//   }
//
//   var max = mianzi(pai, n+1);
//
//   if (n < 7 && pai[n] > 0 && pai[n+1] > 0 && pai[n+2] > 0) {
//     pai[n]--; pai[n+1]--; pai[n+2]--;
//     var r = mianzi(pai, n);
//     pai[n]++; pai[n+1]++; pai[n+2]++;
//     r[0][0]++; r[1][0]++;
//     if (r[0][0]* 2 + r[0][1] > max[0][0]* 2 + max[0][1]) max[0] = r[0];
//     if (r[1][0]*10 + r[1][1] > max[1][0]*10 + max[1][1]) max[1] = r[1];
//   }
//
//   if (pai[n] >= 3) {
//     pai[n] -= 3;
//     var r = mianzi(pai, n);
//     pai[n] += 3;
//     r[0][0]++; r[1][0]++;
//     if (r[0][0]* 2 + r[0][1] > max[0][0]* 2 + max[0][1]) max[0] = r[0];
//     if (r[1][0]*10 + r[1][1] > max[1][0]*10 + max[1][1]) max[1] = r[1];
//   }
//
//   return max;
// }
//
// function mianzi_all(shoupai) {
//
//   var r = {};
//
//   r.m = mianzi(shoupai._shouli.m, 0);
//   r.p = mianzi(shoupai._shouli.p, 0);
//   r.s = mianzi(shoupai._shouli.s, 0);
//
//   r.z = [ 0, 0 ];
//   for (var i = 0; i < 7; i++) {
//     if (shoupai._shouli.z[i] >= 3) r.z[0]++;
//     if (shoupai._shouli.z[i] == 2) r.z[1]++;
//   }
//
//   var min_xiangting = 8;
//
//   for (var m = 0; m < 2; m++) {
//     for (var p = 0; p < 2; p++) {
//       for (var s = 0; s < 2; s++) {
//         var n_mianzi = r.m[m][0] + r.p[p][0] + r.s[s][0] + r.z[0]
//                + shoupai._fulou.length;
//         var n_dazi   = r.m[m][1] + r.p[p][1] + r.s[s][1] + r.z[1];
//         if (n_mianzi + n_dazi > 4) n_dazi = 4 - n_mianzi;
//         var xiangting = 8 - n_mianzi * 2 - n_dazi;
//         if (xiangting < min_xiangting) min_xiangting = xiangting;
//       }
//     }
//   }
//
//   return min_xiangting;
// }

// module.exports = {
//   dazi:    dazi,
//   mianzi:    mianzi,
//   mianzi_all:    mianzi_all,
// }
