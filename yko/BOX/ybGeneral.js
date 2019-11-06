'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const  my = 'ybGeneral.js';
const ver = `yko/${my} v191101`;
//
const Base = require('./ybBaseShema.js');
//
module.exports.Unit = function (P, Cls, co, baseKey) {
  const S = P.root.unitKit(co.name, this, P);
    S.ver = ver;
   S.conf = co;
    S.cls = Cls;
   S.ARGS = baseKey;
  S.get = (key) => {
    return new Promise ( resolve => {
      Cls.findOne(S.$KeyCheck(`${baseKey}.${key}`))
        .then(db=> resolve( new _BOX_ (S, db) ))
        .catch(e=> S.throw(`[BOX:General] Error:`, e));
    });
  };
  S.columns = co.columns || [
    ['key1', null, ['isKey']],
    ['key2', null, ['isKey']],
    ['key3', null, ['isKey']]
  ];
  Base.init(S);
};
function _BOX_ (S, Db) {
  this.ver = my;
  Base.setupTrashStyle(this, S, Db);
  Base.component(this, S);
}
