'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const  my = 'ybCASH.js';
const ver = `yko/${my} v191103`;
//
const T = new (require('../TOOL.js')),
   Base = require('./ybBaseShema.js');
//
module.exports.Unit = function (P, Cls, co, uKey) {
  const S = P.root.unitKit(co.name, this, P);
    S.ver = ver;
   S.conf = co;
    S.cls = Cls;
  S.get = (uniqueKEY) => {
    let Key = uniqueKEY || uKey || '';
    return new Promise ( resolve => {
      return Cls.findOne(S.$KeyCheck(Key.replace(/\./g, '\t')))
        .then(db=> resolve( new _BOX_ (S, db) ))
        .catch(e=> S.throw(`[BOX:Cash] Error:`, e));
    });
  };
  S.clean = async () => {
    S.tr4(`[BOX:Cash] !! clean !!`);
    const Now = T.unix();
    return await Cls.deleteMany({ TTL:{ $lt: Now } });
  };
  S.columns = co.columns
           || [['uniqueKEY', null, ['isKey']]];
  Base.init(S);
};
function _BOX_ (S, Db) {
  this.ver = my;
  const B = Base.setup(this, S, Db);
            Base.component(this, S);
  B.$HOOKS.INSERT = (save) => {
    save.TTL = T.unix_add(checkTTL(B.TTL, S.conf), 'm');
  };
  B.$HOOKS.UPDATE = (save) => {
    if (B.TTL) B.$HOOKS.INSERT(save);
  };
}
function checkTTL (TTL, co) {
  if (! TTL || ! Number(TTL)) return co.TTL;
  if (TTL < co.min_TTL) return co.min_TTL;
  if (TTL > co.max_TTL) return co.max_TTL;
  return TTL;
}
