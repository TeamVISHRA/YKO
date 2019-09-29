//
// yko/Discord/App/ydaTools.js
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const ver = 'ydaTools.js v190924.01';
//
const here = require('here').here;
let Y, P;
module.exports = function (y, p) {
	[Y, P] = [y, p];
  this.ver = ver;
	const S = this;
	S.run = help;
}
function help () {
	P.delete();
	let PF = Y.brain.prefix();
	P.send({ embed: {
		title: 'YKO ヘルプ',
		color: 0x0083FC, fields: [
		{ name: `${PF}dice help`, value: '`・サイコロ機能のヘルプ表示`' },
		{ name: `${PF}sp help`,   value: '`・時間計測機能のヘルプ表示`' },
		{ name: `${PF}tool help`, value: '`・ツール機能のヘルプ表示`' },
		{ name: `${PF}to help`,   value: '`・Twitch 投稿機能のヘルプ表示`' },
	]	} }, 60);
}
