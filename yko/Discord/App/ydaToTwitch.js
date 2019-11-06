//
// yko/Discord/App/ydaToTwitch.js
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const ver = 'ydaToTwitch.js v190912.01';
//
const here = require('here').here;
let R, P, S;
module.exports.Unit = function (p) {
  R = p.root, P = p, T = p.tool;
  S = P.unitKit('tools', this, P);
  S.ver = ver;
	S.run = (crum) => {
    if (! S.rack.has('Twitch'))
        S.throw(`[Discord:toTwitch] Not working.`);
    if (! crum)
        return P.tr(`[Discord:toTwitch] Message is empty.`);
    if (P.isDM()) return P.send('ＤＭからは送信できないよ。');
    return /^\s*help\s*$/i.test(crum) ? help() : post(crum);
	};
};
function help (crum) {
	P.delete();
	let PF = R.brain.prefix();
  const help = {
		title: 'Twitch 投稿機能のヘルプ',
		color: 0x0083FC, fields: [
		{ name: `${PF}to [メッセージ]`,
        value: '`・メッセージを Twitch チャンネルへ`' }
	]	};
  help.dscription =
    `メッセージを Twitch の #milkyvishra に投稿します。`;
	P.send({ embed: help }, 20);
}
function post (crum) {
  const name  = P.nickname();
  const emoji = ':globe_with_meridians: ';
	P.toTwitch(name, crum, () => { return 1 })
  .then(res=> {
  	P.delete();
    const baseURL = R.Twitch.conf.url.base;
  	P.reply({ embed: {
      title: `${emoji}twitch#${res.to} に投稿したよ。`,
      url: baseURL + res.to
    } }, 10);
    if (res.from != P.channelID())
        P.channelSend(res.from, `**${name}**： ${crum}`);
    R.finish();
	})
  .catch(e=> {
    if (! e.result) S.throw(`[Discord:toTwitch]`, e);
    P.reply(`[To Twitch] ${e.result}`, 15);
    R.finish();
  });
}
