'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const  my = 'ybLog.js';
const ver = `yko/${my} v191110`;
//
const T = new (require('../TOOL.js')),
   Base = require('./ybBaseShema.js'),
  Times =
['timeYear','timeMonth','timeDay','timeHour','timeMinute'];
//
module.exports.Unit = function (P, Cls, co, ...Args) {
   const S = P.root.unitKit(co.name, this, P);
     S.ver = ver;
    S.conf = co;
     S.cls = Cls;
  S.add = async (Data) => {
    return new _ADD_ (S, Args[0], Args[1], Data);
  };
  S.get = (_id) => {
    if (! _id) S.throw(`[BOX:Log] '_id' is Unknown.`);
    return new Promise ( resolve => {
      Cls.findOne(S.UNIQUE = { _id: _id })
         .then(db=> resolve( new _BOX_ (S, db) ))
         .catch(e=> S.throw(`[BOX:Log]`, e));
    });
  };
  S.columns = co.columns || [
    ['timeStampUTC', 'utc()', ['isKey']],
    ['ident',  null, ['isString']],
    ['status', null, ['isString', 'toLowerCase',
      'regex("^(?:info|error|warn|report|)$", "i")'
    ]],
    ['Processed', 0, ['isNumber']]
  ];
  Base.init(S);
};
function _ADD_ (S, ident, status, Data) {
  const B = this;
  B.ver = my;
  if (! ident)  S.throw(`[BOX:Log] Unknown identifier.`);
  if (! status) S.throw(`[BOX:Log] Unknown status.`);
  if (Data) {
    if (! T.isHashArray(Data))
      S.throw(`[BOX:Log] Invalid type of 'Data'.`);
  } else {
    S.throw(`[BOX:Log] Unknown Data.`);
  }
  S.$KeyCheck();
  const Db = B.lawData = { value: (Data || []) };
  B._id     = () => { return false };
  B.hasNew  = () => { return true  };
  Base.component(B, S);
  B.set('ident',  ident)
   .set('status', status);
  B.$HOOKS.INSERT = (save) => {
    let i = 0;
    for (let v of T.time_form
    (save.timeStamp, 'YYYY.MM.DD.HH.mm').split('.')) {
      S.tr4(`${B.ver} INSERT> ${Times[i]} (${v})`);
      save[ Times[i++] ] = v;
    }
    S.tr4(`${B.ver} SAVE DATA:`, save);
  };
  B.update().prepar();
  B.prepar = B.remove = false;
}
function _BOX_ (S, Db) {
  this.ver = my;
  const B = Base.setup(this, S, Db);
            Base.component(this, S);
  for (let v of T.v(Times)) { B[v] = () => { return Db[v] } }
  //
  B.$HOOKS.UPDATE = () => {
    S.throw(`[BOX:Log] Do not rewrite.`);
  };
  B.$HOOKS.INSERT = () => {
    S.throw(`[BOX:Log] Use 'box.<collection>.in(...)'.`);
  };
  B.remove = () => {
    S.tr3(`[BOX:Log] remove (origin)`);
    if (! B.$ID) S.throw(`[BOX:Log] This data does not exist.`);
    B.regist(x=> { return S.cls.deleteOne(R.$ID) });
    return B;
  };
}
