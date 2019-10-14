'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ydaTools.js';
const ver = `${my} v191014.01`;
//
let S;
module.exports.Unit = function (P) {
  S = P.unitKit('tools', this, P);
  S.ver = ver;
  S.run = (crum) => {
    const i = S.tool.A2a(crum);
    if (i.match(/^unix\s*(.*)/i)) {
      return unix(RegExp.$1);
    } else {
      return help();
    }
  };
}
function help () {
  S.par.delete();
  let PF = S.root.brain.prefix();
  P.par.send({ embed: {
    title: 'ツール機能のヘルプ',
    color: 0x0083FC, fields: [
      { name: `${PF}unix`,
        value: '`・現在の UNIX時間 を表示`' },
      { name: `${PF}unix [数値]`,
        value: '`・UNIX時間を人の読める形式に変換`' }
  ] } }, 60 );
  S.finish();
}
function unix (arg) {
  const T = S.tool,
        P = S.par;
  P.delete();
  if (arg && arg.match(/(\d+)(?:\.\d*)?/)) {
    let unix = RegExp.$1;
    let conv = T.unix_form(unix, 'YYYY/MM/DD HH:mm:ss');
    const msg = `.
　入力値： ${unix}
変換結果： ${conv}

\`※変換結果が異常な時は、入力桁数を確認してみてね。\`
\`※例えば Discord の内部では、ミリ秒を含む値が使われてたるするから、適当な位置にカンマを入れてみて\`
`; 
    return P.send(msg, 20);
	} else {
	  P.send(`現在のＵＮＩＸ時間： ${T.unix()}`, 20);
	}
  S.finish();
}
