'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ydaTools.js';
const ver = `${my} v191028`;
//
let R, P, S, T;
module.exports.Unit = function (p) {
  R = p.root, P = p, T = p.tool;
  S = P.unitKit('tools', this, P);
  S.ver = ver;
  S.run = (crum) => {
    const i = T.A2a(crum);
    if (i.match(/^unix\s*(.*)/i)) {
      return unix(RegExp.$1);
    } else if (i.match(/^utc\s*(.*)/i)) {
      return utc(RegExp.$1);
    } else {
      return help();
    }
  };
}
function help () {
  P.delete();
  P.send({ embed: {
    title: 'ツール機能のヘルプ',
    color: 0x0083FC, fields: [
    { name: `${PF()}unix`,
      value: '`・現在の UNIX時間 を表示`' },
    { name: `${PF()}unix [数値]`,
      value: '`・UNIX時間を人の読める形式に変換`' },
    { name: `${PF()}utc`,
      value: '`・現在の UNIX時間(ミリ秒) を表示`' },
    { name: `${PF()}utc [数値]`,
      value: '`・UNIX時間(ミリ秒)を人の読める形式に変換`' }
  ] } }, 60 );
  R.finish();
}
function unix (arg) {
  P.delete();
  let msg;
  if (arg && /(\d+)(?:\.\d*)?/.exec(arg)) {
    let input = RegExp.$1;
    let conv = T.unix_form(input, 'YYYY/MM/DD HH:mm:ss');
    msg = `.
変換結果： ${conv}
　入力値： ${input}

\`※結果が異常な時は、${PF()}utc を使ってみてね。\`
`; 
  } else {
    msg = `現在 UNIX時間： ${T.unix()}`;
  }
  P.send(msg, 20);
  R.finish();
}
function utc (arg) {
  P.delete();
  let msg;
  if (arg && /(\d+)/.exec(arg)) {
    let input = RegExp.$1;
    let conv = T.time_form(input, 'YYYY/MM/DD HH:mm:ss');
    msg = `.
変換結果： ${conv}
　入力値： ${input}
`; 
  } else {
    msg = `現在 UNIX時間(ミリ秒)： ${T.utc()}`;
  }
  P.send(msg, 20);
  R.finish();
}
function PF () { return R.brain.prefix() }
