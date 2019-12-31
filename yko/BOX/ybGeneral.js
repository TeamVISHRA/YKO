'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const  my = 'ybGeneral.js';
const ver = `yko/${my} v191202`;
//
const Base = require('./ybBaseShema.js');
//
module.exports.Unit = function (P, Cls, co, baseKey) {
  const S = P.root.unitKit(co.name, this, P);
      S.ver = ver;
     S.conf = co;
      S.cls = Cls;
     S.ARGS = baseKey || '';
      S.get = GET;
   S.append = APPEND;
  S.findOne = FINDONE;
    S.build = BUILD;
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
    return _FIND_(S.$KeyCheck(_KEY_(key)));
  }
  function FINDONE (terms) {
    return _FIND_({ ...(S.$KeyCheck()), ...terms });
  }
  function BUILD (db) {
    return new _BOX_ (S, db);
  }
  function _FIND_ (args) {
    return new Promise ( resolve => {
      Cls.findOne(args)
        .then(db=> resolve( BUILD(db) ))
        .catch(e=> S.throw(`[BOX:General] Error:`, e));
    });
  }
  function _KEY_ (key) {
    return S.ARGS
        ? (key ? `${S.ARGS}.${key}`: S.ARGS)
        : (key || S.throw(`[BOX:General] key is unknown.`));
  }
};
function _BOX_ (S, Db) {
  this.ver = my;
  Base.setupTrashStyle(this, S, Db);
  Base.component(this, S);
}
