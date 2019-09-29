//
// yko/Discord/App/ydaSplittime.js
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const ver = 'ydaSplittime.js v190912.01';
//
const C = {
	barColor: 0xb1eb34,
	history: { limit: 20 },
	cash: {
		life: (10* 60),
		lifeMin: 10,
		lifeMax: (3* (24* 60))
	}
};
const here = require('here').here;
//
module.exports = function (Y, P, arg) {
  this.ver = ver;
	const S = this;
	const T = Y.tool;
	const PF = Y.brain.prefix();
	const m = message(Y, PF);
	S.run = (crum) => {
		const dataKey = {
			id: Y.Discord.buildDataID(P.guildID()),
			name: S.buildName()
		};
		if (! P.isDM()) P.delete();
		let i = T.A2a(crum);
		if (i.match(/^\s*start\s*(.*)/)) {
			S.START(dataKey, RegExp.$1);
		} else if (i.match(/^\s*lap/)) {
			S.LAP(dataKey);
		} else if (i.match(/^\s*history/)) {
			S.HISTORY(dataKey);
		} else if (i.match(/^\s*reset\s+start\s*(.*)/)) {
			S.RESET_START(dataKey);
		} else if (i.match(/^\s*end/)) {
			S.END(dataKey);
		} else {
			S.HELP(); P.finish();
		}
	};
	S.buildName = () => {
		const id = P.userID();
		return `_APP_SPLITTIME_${id}_`;
	};
	S.HELP = () => {
		P.send({ embed: {
			title: '時間計測機能のヘルプ',
			color: 0x0083FC, fields: [
			{ name: `${PF}sp start`,
				value: '`・計測の開始`' },
			{ name: `${PF}sp lap`,
				value: '`・開始からの経過時間を記録\n　※最大記録件数： 20`' },
			{ name: `${PF}sp history`,
				value: '`・記録の履歴表示`' },
			{ name: `${PF}sp reset-start`,
				value: '`・履歴を初期化して再計測`' },
			{ name: `${PF}sp end`,
				value: '`・計測終了（データ消去）`' }
		], footer: ver	} }, 60).then(o=> { P.finish() });
	};
	S.baseEmbed = (a) => {
		const embed = {
			color: C.barColor,
			author: { name: P.nickname(),	icon_url: P.avatarURL()	}
		};
		if (a) {
			for (let [k, v] of Object.entries(a)) { embed[k] = v }
		}
		return embed;
	};
	S.checkLife = (n) => {
		if (! n || ! n.match(/^\s*(\d+)/)) return C.cash.life;
		n = RegXep.$1;
		if (n < C.cash.lifeMin) n = C.cash.lifeMin;
		if (n > C.cash.lifeMax) n = C.cash.lifeMax;
		return n;
	};
	S.START = (key, str, BOX) => {
		new Promise ( async resolve => {
			let embed = S.baseEmbed();
			if (BOX) {
				embed.title = 'データ初期化（計測を継続）';
			} else {
				embed.title = '時間の計測を開始';
				await Y.box.cash(key).then( box => { BOX = box });
				if (! BOX.isNew())
						return resolve( P.reply(m.MEASURING, 5) );
			}
			embed.description = T.tmpl( here(/*
-----------------------------------
開始時刻：　<stime>
-----------------------------------
有効時間：　<life>
`<prefix>sp lap で経過時間を記録します。`
`<ver>`
*/).unindent(), {
				stime: T.time_u_form( BOX.set('startTime', T.time_u()) ),
				life: T.min2form(BOX.life = S.checkLife(str)),
				prefix: PF, ver: ver
			});
			BOX.set('laps', []);
			BOX.preper();
			resolve( P.send({ embed: embed }, 60) );
		}).then(o=> { P.finish() });
	};
	S.RESET_START = async (dataKey, str) => {
		let BOX;
		await Y.box.cash(dataKey).then( box => { BOX = box });
		if (BOX.isNew()) {
			return P.reply(m.NOTSTART, 5).then(o => { P.finish() });
		}
		BOX.del('laps');
		S.START(dataKey, str, BOX);
	};
	S.LAP = (dataKey) => {
		return new Promise ( async resolve => {
			let BOX;
			await Y.box.cash(dataKey).then( box => { BOX = box });
			if (BOX.isNew())
					return resolve( P.reply(m.NOTSTART, 5) );
			const Laps = BOX.get('laps');
			const Now  = T.time_u();
			const Diff = Now - Number( BOX.get('startTime') );
			const Humn = T.sec2form(Diff);
			BOX.set('laps', T.push2cut(Laps,
			{ time: Now, diff: Diff, humn: Humn }, C.history.limit));
			BOX.preper();
			let embed = S.baseEmbed({ title: '経過時間を記録' });
			embed.description = T.tmpl( here(/*
<startTime> ～ <lapTime>
-----------------------------------
経過：　**<humn>**

`※履歴の確認`　 <prefix>sp history
`<ver>`
*/).unindent(), {
				startTime: T.time_u_form(BOX.get('startTime')),
				lapTime:   T.time_u_form(Now),
				humn: Humn, prefix: PF, ver: ver
			});
			resolve( P.send({ embed: embed }, 15) );
		}).then(o=> { P.finish() });
	};
	S.HISTORY = (dataKey) => {
		return new Promise ( async resolve => {
			let BOX;
			await Y.box.cash(dataKey).then( box => { BOX = box });
			if (BOX.isNew())
					return resolve( P.reply(m.NOTSTART, 10) );
			const Laps = BOX.get('laps');
			if (Laps.length < 1)
					return resolve( P.reply(m.NODATA, 10) );
			const embed = S.baseEmbed
						({ title: '経過時間の計測履歴', fields: [] });
			embed.description = T.tmpl( here(/*
`開始時間： <startTime>`
------------------------------
*/).unindent(), {
				startTime: T.time_u_form(BOX.get('startTime'))
			});
			let count = 0;
			for (let v of Laps) {
				let d1 = '[ ' + ++count + ' ]　**' + v.disp + ' 経過**';
				let d2 = '`' + T.time_u_form(v.time) + '`';
				embed.fields.push({ name: d1, value: d2 });
			}
			embed.footer = `※計測リセット　;sp reset-start　- ${ver}`;
			resolve( P.send({ embed: embed }, 180) );
		}).then(o=> { P.finish() });
	};
	S.END = (dataKey) => {
		return new Promise ( async resolve => {
			let BOX;
			await Y.box.cash(dataKey).then( box => { BOX = box });
			if (BOX.isNew()) return resolve( P.reply(m.NOTSTART, 10) );
			BOX.remove();
			resolve( P.reply('データを消去して計測を終了しました。', 15) );
		}).then(o=> { P.finish() });
	};
}
function message (Y, PF) {
	const T = Y.tool;
	return {
		MEASURING: T.tmpl('既に計測中どす。\n`終了： <pf>sp end`', { pf: PF }),
		NOTSTART: T.tmpl('まだ開始してないよ。\n`開始： <pf>sp start`', { pf: PF }),
		NODATA: T.tmpl('データが無いです・・・\n`計測： <pf>sp start`', { pf: PF })
	}
}