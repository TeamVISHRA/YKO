//
// yko/Discord/App/ydaToTwitch.js
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const ver = 'ydaToTwitch.js v190912.01';
//
const here = require('here').here;
let Y, P;
module.exports = function (y, p, arg) {
  [Y, P] = [y, p];
  this.ver = ver;
	const S = this;
  const emoji = ':globe_with_meridians: ';
	S.run = (crum) => {
    if (! crum) return;
    if (P.isDM()) return P.send('ＤＭからは送信できないよ。');
    if (crum.match(/^\s*[Hh][Ee][Ll][Pp]\s*$/)) {
      return help();
    } else {
      return post(crum);
    }
	};
};
function help (crum) {
	P.delete();
	let PF = Y.brain.prefix();
  const help = {
		title: 'Twitch 投稿機能のヘルプ',
		color: 0x0083FC, fields: [
		{ name: `${PF}to [メッセージ]`,
        value: '`・メッセージを Twitch チャンネルへ`' }
	]	};
  help.dscription= here(/*
メッセージを Twitch の #milkyvishra に投稿します。
注意）送信したコマンド文字列は消去されます。
*/).unindent();
	P.send({ embed: help }, 20);
}
function post (crum) {
  const name = P.nickname();
	P.toTwitch(name, crum, 1).then(c => {
    const baseURL = Y.Twitch.conf.baseURL;
  	P.delete();
  	if (c) {
    	P.reply({ embed: {
        title: `${emoji}twitch#${c[1]} に投稿したよ。`,
        url: baseURL + c[1]
      } }, 10);
    	P.channelSend(c[0], `**${name}**：` + c[2]);
  	} else {
    	P.reply('Twitch への送信失敗。`※原因）送信設定が無い`', 10 );
  	}
    P.finish();
	});
}
