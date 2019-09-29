//
// yko/Discord/App/ydaTools.js
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const ver = 'ydaTools.js v190924.01';
//
const here = require('here').here;
let Y, P, T;
module.exports = function (y, p) {
	[Y, P] = [y, p];
  this.ver = ver;
	const S = this;
	T = Y.tool;
	S.run = (crum) => {
		const a = Y.tool.A2a(crum);
		if (a.match(/^unix\s*(.*)/)) {
			return unix(RegExp.$1);
		} else {
			return help();
		}
	};
};
function help () {
	P.delete();
	let PF = Y.brain.prefix();
	P.send({ embed: {
		title: 'ツール機能のヘルプ',
		color: 0x0083FC, fields: [
		{ name: `${PF}unix`,
				value: '`・現在の UNIX時間 を表示`' },
		{ name: `${PF}unix [数値]`,
				value: '`・UNIX時間を人の読める形式に変換`' }
	]	} }, 60);
}
function unix (arg) {
	P.delete();
	if (arg && arg.match(/(\d+)(?:\.\d*)?/)) {
		let unix = RegExp.$1;
		let conv = T.unix_form(unix, 'YYYY/MM/DD HH:mm:ss');
		return P.send(T.tmpl(here(/*
　入力値： <u>
変換結果： <c>

`※変換結果が異常な時は、入力桁数を確認してみてね。`
`※例えば Discord の内部では、ミリ秒を含む値が使われてたるするから、適当な位置にカンマを入れてみて`
*/).unindent(), { u:unix, c:conv }), 10);
	} else {
		return P.send(`現在のＵＮＩＸ時間： ${T.unix()}`, 10);
	}
}
