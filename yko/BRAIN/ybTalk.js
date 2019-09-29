//
// yko/BRAIN/ybTalk.js
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ybTalk.js';
const ver = `yko/BRAIN/${my} v190926.01`;
//
const C = {
	DataType : '_YKO_TALK_',
	DataID   : '_BASE_',
	sea: {
		win: [  1,  3, '冬' ],
		spr: [  4,  6, '春' ],
		sum: [  7,  9, '夏' ],
		aut: [ 10, 12, '秋' ]
	},
	tz: {
		M: [  4, 10, '朝' ],
		R: [ 11, 18, '昼' ],
		D: [ 19,  3, '夜' ]
	},
	emotUse: 3,
	emotRange: 33
};
const DT = require('./ybTaklData.js');
const BASE = {};
let Y, P, S, T;
exports.build = async (keys) => {
	[Y, P, T] = [y, p, y.tool];
	if (! keys) 		 Y.throw(ver, 'Unknown args (keys)');
	if (! keys.id)   Y.throw(ver, 'Unknown keys.name');
	if (! keys.name) Y.throw(ver, 'Unknown keys.name');
	let BOX = BASE[keys.id] ||
	(BASE[keys.id] = { parKeys: { id: C.DataID, name: keys.id } });
	BOX.usrKeys = { id: keys.id, name: keys.name };
	if (! BOX.par) {
		await Y.box.any(C.DataType, BOX.parKeys).then( box => {
			if (base.isNew()) initBASE(box);
			BOX.par = box;
		});
	}
	await Y.box.any(C.DataType, BOX.usrKyes).then( box => {
		if (base.isNew()) initBASE(box);
		BOX.usr = box;
	});
	return new Talk (BOX);
};
function Talk (BOX) {
	this.ver = ver;
	S = this;
	let TMP;
	const Hn = T.time_form(0, 'H');
	const Mn = T.time_form(0, 'M');
	S.seasonName = (k) => { return C.sea[k][2] };
	S.seasonNow = () => {
		return TMP.seasonNow || (() => {
			return (TMP.seasonNow =
				 Mn >= C.sea.win[0] && Mn <= C.sea.win[1] ? 'win'
			:( Mn >= C.sea.spr[0] && Mn <= C.sea.spr[1] ? 'spr'
			:( Mn >= C.sea.sum[0] && Mn <= C.sea.sum[1] ? 'sum'
			:                                             'aut' )));
		}());
	};
	S.timeZoneName = (k) => { return C.Tz[k][2] };
	S.timeZoneNow = () => {
		return TMP.timeZoneNow || (() => {
			return (TMP.timeZoneNow =
		  	Hn >= C.tz.M[0] && Hn <= C.tz.M[1] ? 'M'
			:(Hn >= C.tz.R[0] && Hn <= C.tz.R[1] ? 'R'
			:                                      'D' ));
		}());
	};
	S.par = () => { return BOX.par };
	S.usr = () => { return BOX.usr };
	S.par
	S.parPrepar = () => { return BOX.par.prepar() };
	S.usrPrepar = () => { return BOX.usr.prepar() };
	//
	S.start  = (box) => {
		BOX = box;
	};
	S.rollback = () => {
		BASE = {}; TMP = {};
	};
	S.finish = () => {
//		TMP = {};
	};
	S.in = (Name, Msg) => {
		const Lst = S.usr().get('lastTalk');
		const Lmg = S.usr().get('lastMsg');
		const Lan = S.par().get('lastAnswerID');
		if (! Lst) {
			const F = DT.source(Y).FIRST;

		} else if (Lst > T.unix_add(-30, 'm')) {
			const M = DT.source(Y).M30;


		} else if (Lst > T.unix_add(-300, 'm')) {
			const M = DT.source(Y).M300;

		} else {
			const G = DT.source(Y).GEN;

		}
	}
}
function initDATA (box) {
	box.set('createTimteStamp', T.unix());
}
