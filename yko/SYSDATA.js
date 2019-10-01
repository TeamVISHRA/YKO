//
// yko/SYSDATA.js
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'SYSDATA.js';
const ver = `yko/${my} v191001.01`;
//
const BOX = require('./BOX.js');
//
let Y, YS, T;
module.exports = function (y, KEYS) {
	this.ver = ver;
	[YS, Y, T] = [this, y, y.tool];
	const SYSKEY = KEYS
				|| Y.throw(ver, 'Unknown key.');
	const TYPE = SYSKEY.type
				|| Y.throw(ver, 'Unknown type.');
	const LIMIT = SYSKEY.limit || SYSKEY.life || 15; // minute
	const POOL = {};
	YS.box = new BOX (Y);
	YS.POOL = POOL;
	//
	YS.noCash = async (keys) => {
		Y.tr1('noCash');
		let Db;
		await YS.box.any(TYPE, SYSKEY).then( db => {
			Y.tr3('noCash:Y.box.any()', SYSKEY);
			Db = db.isNew() ? {}: new noCash (db, keys);
		});
		return Db;
	};
	YS.cash = async (keys) => {
		Y.tr1('cash');
		const KEY = keys.join('@');
		let Db = POOL[KEY];
		if (Db && Db.$Limit < Y.tool.time_u()) Db = false;
		if (! Db) {
			await YS.box.any(SYSKEY.type, SYSKEY).then( db => {
				Y.tr3('cash:Y.box.any()', SYSKEY);
				const Limit = Y.tool.time_u_add(LIMIT, 'm');
				Db = POOL[KEY] = db.isNew()
							? { $Limit: Limit }
							: new cash (db, keys, KEY, Limit);
			});
		}
		return Db;
	};
	YS.cleanCash = async () => {
		Y.tr1('cleanCash');
		const Now = Y.tool.time_u();
		for (let [k, v] of Object.entries(POOL)) {
			if (v.$Limit < Now) delete POOL[k];
		}
		return true;
	};
}
function cash (H, KEYS, KEY, LIMIT) {
	const S = this;
	const VALUE = T.quest(H.ref(), KEYS);
	const CLEAR = () => {
		if (POOL[KEY]) delete POOL[KEY];
	};
	if (VALUE) {
		S.$aleady = true;
		S.value = VALUE;
		S.$clear = () => { return CLEAR() };
		S.$handler = () => { return H };
	}
	S.$Limit = LIMIT;
}
function noCash (H, KEYS) {
	const S = this;
	const VALUE = T.quest(H.ref(), KEYS);
	if (VALUE) {
		const UPDATE = () => {
			H.update();
			H.preper();
			YS.box.commit();
		};
		const REMOVE = () => {
			if (! S.$deleteOK())
					Y.throw(ver, 'Data that cannot be deleted.');
			let keys = T.clone(KEYS);
			let last = keys.pop();
			let child = T.quest(H.ref(), keys);
			if (child && last in child) {
				delete child[last];
				UPDATE();
			}
		};
		S.$aleady = true;
		S.value = VALUE;
		S.$update = () => { return UPDATE() };
		S.$delete = () => { return REMOVE() };
		S.$handler = () => { return H };
		S.$deleteOK = () => { return VALUE.deleteOK };
	}
}
