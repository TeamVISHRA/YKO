'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const  my = 'ybMember.js';
const ver = `yko/${my} v191030`;
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
      Cls.findOne(S.$KeyCheck(key))
        .then(db=> resolve( new BOX (S, db) ))
        .catch(e=> S.throw(`[BOX:Member]`, e));
    });
  };
  S.columns = co.columns || [
    ['groupID', null, ['isKey']],
    ['userID',  null, ['isKey']],
    ['timelastPost', 'UTC()', ['isNumber']]
  ];
  Base.init(S);
};
function BOX (S, Db) {
  this.ver = my;
  Base.setupTrashStyle(this, S, Db);
  Base.component(this, S);
}
