'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'SYSDATA.js';
const ver = `yko/${my} v191008.01`;
//
module.exports.Unit = function (Y, R, Ref, KEYS) {
  const S = this;
	S.ver = ver;
  S.root = R;
  S.KEYS = KEYS;
  S.conf = Y.conf.sysdata;
  S.SYSKEY = KEYS
			|| S.conf.keys || Y.throw(ver, 'Unknown keys.');
  S.TYPE  = S.SYSKEY.type || Y.throw(ver, 'Unknown type.');
  S.LIMIT = S.SYSKEY.limit
      || S.SYSKEY.life || S.conf.limit || 15; // minute
  const T = Y.tool;
  S.GC = Ref.CASH || (Ref.CASH = T.c(null));
  S.noCash = async (ks) => {
		Y.tr1('noCash');
		let Db;
		await R.box.any(S.TYPE, S.SYSKEY).then( H => {
			Y.tr3('noCash:Y.box.any()', S.SYSKEY);
			Db = H.isNew() ? {}: new noCash (Y, S, ks, H, T);
		});
		return Db;
	};
	S.cash = async (keys) => {
		Y.tr1('cash');
		const e =
      { keys: keys, key: ('CA:' + keys.join('@')) };
    return S.GC[e.key] || (async () => {
			await R.box.any(S.TYPE, S.SYSKEY).then( H => {
				Y.tr3('cash:Y.box.any()', S.SYSKEY);
        e.limit = T.unix_add(S.LIMIT, 'm');
				e.Db = H.isNew() ? { $Limit: e.limit }
						              : new cash (Y, S, e, H, T);
        S.GC[KEY] = T.clone(e.Db);
			});
      return S.GC[KEY];
    })();
	};
	S.cleanCash = async () => {
		Y.tr1('cleanCash');
		const Now = T.unix();
		for (let [k, v] of T.e(R))
        { if (v.$Limit < Now) delete R[k] }
		return true;
	};
}
function cash (Y, S, e, H, T) {
	const CA = this,
	   VALUE = T.quest(H.ref(), KEYS),
	   CLEAR = () => { if (S.GC[e.key]) delete S.GC[e.key] };
	if (VALUE) {
		 CA.$aleady = true;
		   CA.value = VALUE;
		  CA.$clear = () => { return CLEAR() };
		CA.$handler = () => { return H };
	}
	CA.$Limit = e.limit;
}
function noCash (Y, S, KEYS, H, T) {
	const CA = this,
	   VALUE = T.quest(H.ref(), KEYS);
	if (VALUE) {
		const UPDATE = () => {
			H.update();
			H.preper();
		};
		const REMOVE = () => {
			if (! CA.$deleteOK())
					Y.throw(ver, 'Data that cannot be deleted.');
			let keys  = T.clone(KEYS);
			let last  = keys.pop();
			let child = T.quest(H.ref(), keys);
			if (child && last in child) {
				delete child[last];
				UPDATE();
			}
		};
		  CA.$aleady = true;
		    CA.value = VALUE;
		  CA.$update = () => { return UPDATE() };
		  CA.$delete = () => { return REMOVE() };
		 CA.$handler = () => { return H };
		CA.$deleteOK = () => { return VALUE.deleteOK };
	}
}
