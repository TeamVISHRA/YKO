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
  const emoji = ':globe_with_meridians: ';
	P.toTwitch(name, crum, 1).then(res=> {
    const baseURL = Y.conf.twitch.url.base;
  	P.delete();
  	if (res) {
    	P.reply({ embed: {
        title: `${emoji}twitch#${res[1]} に投稿したよ。`,
        url: baseURL + res[1]
      } }, 10);
    	P.channelSend(res[0], `**${name}**： ${crum}`);
  	} else {
    	P.reply('Twitch への送信失敗。', 10);
  	}
    P.root.finish();
	});
}
