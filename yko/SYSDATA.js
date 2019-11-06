'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'SYSDATA.js';
const ver = `yko/${my} v191105`;
//
const DefaultTTL   = 20; // minute.
const DefaultIdent = 'system-config';
//
module.exports.Unit = function (R, Ref, KEYs) {
     const S = R.unitKit('sysdata', this, R, Ref);
       S.ver = ver;
     const T = S.tool;
    S.$ident = S.conf.identKey || DefaultIdent;
       S.TTL = S.conf.TTL      || DefaultTTL;
    const pC = R.procCash(),
         BOX = new Map([]);
  S.member = async (mKey) => {
    const mD = R.tmp.MEMBERS || (R.tmp.MEMBERS = T.c(null));
    const key = (KEYs = T.A2a(KEYs))
        + '.' + (mKey = T.canon(mKey));
    if (mD[key]) return mD[key];
    let db; await R.box[KEYs]().get(mKey).then(x=> db = x);
    return (mD[key] = db);
  };
  S.box = async () => {
    if (! KEYs) S.throw('[sysDB] Unknown keys.');
    S.tr4('[sysDB] box', KEYs);
    if (! BOX.has(KEYs)) {
      await R.box.default(KEYs).get(S.$ident).then(x=> {
        BOX.set(KEYs, T.isStr(x) ? R.see(x): x);
      });
    }
    return BOX.get(KEYs);
  };
  S.cash = async (key) => {
    if (! KEYs) S.throw('[sysDB] Unknown keys.');
    const cKey = `${KEYs}.${key || '<root>'}`;
    S.tr4('[sysDB] cash', cKey);
    if (! pC.has(cKey)) { let Bx;
      await S.box().then(box=> Bx = box);
      pC.set(cKey, T.quest(Bx.ref(), key));
    }
    return pC.get(cKey);
  };
}
