'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const  my = 'ybGeneral.js';
const ver = `yko/${my} v191129`;
//
const Base = require('./ybBaseShema.js');
//
module.exports.Unit = function (P, Cls, co, baseKey) {
  const S = P.root.unitKit(co.name, this, P);
    S.ver = ver;
   S.conf = co;
    S.cls = Cls;
   S.ARGS = baseKey;
 S.append = APPEND;
    S.get = GET;
  S.columns = co.columns || [
    ['key1', null, ['isKey']],
    ['key2', null, ['isKey']],
    ['key3', null, ['isKey']]
  ];
  Base.init(S);
  //
  function APPEND (data) {
    S.$KeyCheck(baseKey);
    Base.setup(this, S);
    Base.component(this, S);
    for (let [key, value] of S.tool.e(data))
      { this.set(key, value) }
    this.prepar();
    return true;
  }
  function GET (key) {
    return new Promise ( resolve => {
      Cls.findOne(S.$KeyCheck(`${baseKey}.${key}`))
        .then(db=> resolve( new _BOX_ (S, db) ))
        .catch(e=> S.throw(`[BOX:General] Error:`, e));
    });
  }
};
function _BOX_ (S, Db) {
  this.ver = my;
  Base.setupTrashStyle(this, S, Db);
  Base.component(this, S);
}
