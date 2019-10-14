'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'SYSDATA.js';
const ver = `yko/${my} v191014.01`;
//
const DefaultTTL = 20; // minute.
//
module.exports.Unit = function (R, Ref, KEYS) {
     const S = R.unitKit('sysdata', this, R, Ref);
       S.ver = ver;
     const T = S.tool;
      S.KEYS = KEYS
            || S.conf.keys || S.throw('[sysDB] Unknown keys.');
      S.TYPE = S.KEYS.type || S.throw('[sysDB] Unknown type.');
       S.TTL = S.KEYS.TTL  || S.conf.TTL || DefaultTTL;
    S.UNIQUE = [S.TYPE, S.KEYS.id, S.KEYS.name].join('\t');
     S.reset = () => { return Ref.CASH[S.UNIQUE] = T.c(null) };
  const CASH = Ref.CASH[S.UNIQUE] || S.reset();
  let BOX;
  S.box = async () => {
    S.tr3('[sysDB] box');
    return BOX || (async () => {
      await R.box.any(S.TYPE, S.KEYS).then(x=> BOX = x );
      return BOX;
    }) ();
  };
  S.get = async (key) => {
    S.tr3('[sysDB] get', key);
    return CASH[key] ? CASH[key].value: (async () => {
      await S.box().then();
      CASH[key]= {
          key: key,
        limit: T.unix_add(S.TTL, 'm'),
        value: T.quest(BOX.ref(), key.split('.'))
      };
      return CASH[key].value;
    }) ();
  };
  S.clean = async () => {
    S.tr3('[sysDB] clean');
    const now = T.unix();
    for (let [k, v] of T.e(CASH)) {
      if (v.limit < now) delete CASH[k];
    }
  };
}
