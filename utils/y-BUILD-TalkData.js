//
// y-build-TalkData.js
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const ver = 'y-build-TalkData.js v190916.01';
//
const yko = require('./yko/CORE.js');
const Y = new yko ();
//
const TYPE = Y.conf.brain.talk.Datakeys;
const Gid  = Y.im.discord.devel.guild;
const DATA = talkData();
const KEYS = {
	id: Gid, name: Gid
};
//
for (let [k, v] of Object.entries(DATA)) {
	Y.box.any()
}
//
function talkData () {
	return {
	W00000: { P:0, EM: 3, TR:-5, SEA: 0, TZ: 0,
		RES:'<name>さん、はじめまして' },
	W00100: { P:1, EM: 3, TR:-2, SEA: 0, TZ: 0,
		RES:'<name>さん、いらっしゃい' },
	W00110: { P:1, EM: 3, TR:-2, SEA: 0, TZ: 0,
		RES:'<name>さん、ごゆっくり' },

	W00210: { P:2, EM: 1, SEA: 0, TZ: 'M', TR:-2,
		RES:'<name>さん、グットモーニング娘' },
	W00220: { P:2, EM: 2, SEA: 0, TZ: 'M', TR:-2,
	 	RES:'<name>さん、おめざめ' },
	W00230: { P:2, EM: 3, SEA: 0, TZ: 'M', TR:-2,
	 	RES:'<name>さん、おはよう' },
	W00240: { P:2, EM: 4, SEA: 0, TZ: 'M', TR:+1,
	 	RES:'<name>さん、おっはぁ' },
	W00250: { P:2, EM: 5, SEA: 0, TZ: 'M', TR:+2,
	 	RES:'<name> おは' },

	W00220: { P:1, RES:'<name>さん、こんにちわ',  EM: 2, SEA: 0, TZ: 'R', TR:-1 },
	W00220: { P:1, RES:'<name>さん、こんにちわ',  EM: 3, SEA: 0, TZ: 'R', TR:-1 },

	W00220: { P:1, RES:'<name>さん、こんばんわ',  EM: 3, SEA: 0, TZ: 'D', TR:0 },

	G00050: { P:1, RES:'<name>さん、まいどっ',     EM: 3, SEA: 0, TZ: 0, TR:-3 },
	G00060: { P:1, RES:'<name>さん、おひさです。', EM: 3, SEA: 0, TZ: 0, TR:-3 },
	G00070: { P:1, RES:'<name>さん、お元気ですか', EM: 3, SEA: 0, TZ: 0, TR:-3 },
	};
}
