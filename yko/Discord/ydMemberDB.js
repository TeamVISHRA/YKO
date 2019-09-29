//
// yko/Discord/ydMemberDB.js
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const ver = 'yko/Discord/ydMemberDB.js v190918.01';
//
const C = {
	point_cmd  :   50,
	point_call :   10,
	rank_range : 1000,
	marking: {
	'名詞'  : [100, 50, 15,  7,  2,   0,  -5, -10, -15],
	'助詞'  : [ 20, 10,  0,  0, -5, -10, -15, -20, -25],
	'動詞'  : [ 40, 20, 10,  5,  0, - 5, -10, -15, -20],
	'助動詞': [ 30, 15,  0,  0, -5, -10, -15, -20, -25],
	'記号'  : [ 10,  5,  0,  0,  0,  -5, -10, -15, -20]
	}
};
const here = require('here').here;
//
module.exports = function (Y, P, mainLib) {
  this.ver = ver;
	const S  = this;
	const T  = Y.tool;
	const PF = Y.brain.prefix();
	const cmdReg = new RegExp(`(.+)\\s+${PF}[Aa][Nn]\\s*$`);
	const TYPE   = 'DiscordGuildMembers';
	const DBKEYS = (guildID, userID) => {
		if (! guildID) Y.throw(ver, 'Unknown guild id');
		if (! userID ) Y.throw(ver, 'Unknown user id');
		return { id: guildID, name: userID };
	};
	const POINT_DAY = {
		[ T.time_u_form('D') ]: { countPost  : 0, countPoint : 0 }
	};
	S.view = (guildID, userID) => {
		return Y.box.any(TYPE, DBKEYS(guildID, userID));
	};
	S.list = () => {
		return Y.box.list(TYPE, DBKEYS(guildID, 'N/A'));
	}
	S.incP = async (MSG, is) => {
		if (MSG.isDM()) return;
		const Gid = MSG.guildID();
		const Uid = MSG.userID();
		const DayNow = T.time_u_form('D');
		await S.view(Gid, Uid).then( async box => {
			const Cid = MSG.channelID();
			if (box.isNew())
				box.set('createTimeStamp', Y.tool.time_u());
			if (! box.has('message')) {
				box.set('message', {
					Rank:  0,
					post:  0, totalPost : 0,
					point: 0, totalPoint: 0,
					channels: {}
				});
			}
			const Msg = box.get('message');
			if (! Msg.channels[Cid]) {
				Msg.channels[Cid] = { totalPost: 0, totalPoint: 0 };
			}
			let report = () => {};
			let pointNow = 0;
			if (is.call) pointNow += C.point_call;
			if (is.cmd) {
				pointNow += C.point_cmd;
			} else {
				let m = MSG.content() || '';
				if (m.match(cmdReg)) { m = RegExp.$1; report = false }
				let R;
				await PointMarking
							(Y, MSG.content()).then( res => { R = res });
				pointNow += R.point;
				if (! report) {
					report = () => {
						MSG.send({ embed: mkEmbed(Y, MSG, T, R) }, 10);
					};
				}
			}
			++Msg.post;
			++Msg.totalPost;
			++Msg.channels[Cid].totalPost;
			//
			Msg.point += pointNow;
			Msg.totalPoint += pointNow;
			Msg.channels[Cid].totalPoint += pointNow;
			Msg.getPointLast = pointNow;
			const rank = Math.floor(Msg.point / C.rank_range);
			if (Msg.rank < rank) {
				MSG.reply('Rank up: ' + Msg.rank + ` 👉 **${rank}**`, 10);
				Msg.rank = rank;
			}
			//
			Msg.lastPostTime = Msg.channels[Cid].lastPostTime = T.time_u();
			report();
			box.preper();
		});
		return MSG;
	};
	S.PointMarking = (str) => { PointMarking(Y, str) };
	S.reportSend = () => {  };
};
async function PointMarking (Y, STR) {
	const Mark = C.marking;
	const Last = Mark['名詞'].length - 1;
	STR = Y.tool.canon(STR);
	let [sub, substr, rate, TargetLength, TargetStr]
		= [0, '', 0, 0, ''];
	if (STR.match(/^\s*(https?\:\/\/[!-~]+)/)) {
		STR  = RegExp.$1.length;
		TargetLength = STR.length;
		rate = (sub > 50 ? 50 : sub)/ 100;
	} else if (STR.match(/^(.+)\s*(https?\:\/\/[!-~]+)/)) {
		[STR, substr] = [RegExp.$1, RegExp.$2];
		sub = (substr.length > 50) ? 50 : substr.length;
	}
	STR = STR.replace(/(.)\1\1+/g, reg => {
		let s = reg.split('')[0];
		return `${s}${s}`;
	});
	TargetLength = Y.tool.zTwoCount(STR) + sub;
	TargetStr = `${STR} ${substr}`;
	let result = {};
	if (! rate) {
		for (let k in base) { result[k] = 0 }
		let token;
		await Y.tool.Analys(STR).then( res => { token = res });
		let point = 0;
		for (let v of token) {
			if (Mark[v.pos]) {
				let p = Mark[v.pos][result[v.pos]];
				if (! p && p != 0) p = Mark[v.pos][Last];
				point += p;
				++result[v.pos];
			}
		}
		if (point < 1) {
			let cor = {};
			for (let k of STR.split('')) { cor[k] = 1 }
			point = Object.keys(cor).length;
		}
		rate = (point + sub)/ 100;
	}
	return {
		rate: (rate || 0),
		point: (Math.ceil(TargetLength* rate) || 0),
		targetLength: TargetLength,
		targetStr: TargetStr,
		analysis: result
	};
}
function mkEmbed (Y, MSG, T, R) {
	const Embed = {
		title: '👁‍🗨投稿メッセージ解析',
		color: 0x308bd5,
		author: {
			name: MSG.nickname(),
			icon_url: MSG.avatarURL()
		},
		fields: [],
		footer: { text: ver }
	};
	R.targetStr = T.byte2cut(R.targetStr, 200, '...');
	Embed.description = T.tmpl( here(/*
🔸獲得ポイント： **<point>**
🔸評価レート　： **<rate>**
🔸評価文字数　： **<targetLength>**
🔸評価文字列　： **<targetStr>**
*/).unindent(), R);
	for (let [k, v] of Object.entries()) {
		Embed.fields.push({ name: `🔹${k} >> **${v}**` });
	}
	return Embed;
}
