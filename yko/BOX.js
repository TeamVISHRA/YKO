'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'BOX.js';
const ver = `yko/${my} v191110`;
//
module.exports.init = function (Y, Ref) {
  const S = Y.superKit('box', this, Y, Ref);
  S.ver = ver;
  if (! S.conf.db)
        Y.throw("[BOX] 'Y.conf.box.db' is undefined");
  const JS = require(`./BOX/yb${S.conf.db}.js`);
  Ref.DBdriver = new JS.init (S);
};
module.exports.Unit = function (R, Ref) {
	const U = R.unitKit('box', this, R, Ref);
    U.ver = ver;
  const DB = Ref.DBdriver
        || U.throw(`[BOX] 'DBdriver' setup was not done.`);
  U.DB = () => { return DB };
  U.direct = () => { return DB.connect() };
  const Bowl = new Map([]);
  U.begin = ()  => {
    U.tr3('[BOX] << begin >>');
    Bowl.set('PREPARS', []);
  };
  U.rollback = () => {
    U.tr3('[BOX] << rollback >>');
    Bowl.set('PREPARS', []);
  };
  U.regist = (F) => {
    Bowl.get('PREPARS').push(F);
    return U;
  };
  U.commit = async () => {
    U.tr3('[BOX] << commit >>');
    const PREPARS = Bowl.get('PREPARS');
    const Len = PREPARS.length;
    if (Len > 0) {
      U.tr3(`[BOX] commit:exec (${Len})`);
      let count = 0;
      for (let f of PREPARS) {
        await f().then(o => {
          if (o) U.tr3(`[BOX] ${ver}`, o);
          if (++count >= Len) return true;
        }).catch(e=> U.throw(`[BOX] commit - Error`, e));
      }
      Bowl.set('PREPARS', []);
    }
    return U;
  };
  U.disconnect = () => {
    U.tr3('[BOX] disconnect');
    DB.disconnect();
  };
  const Shema = U.conf.schema;
  for (let [key, v] of U.tool.e(DB.collections())) {
    U[key] = (...arg) => {
      const Cls = DB.collection(key);
      const conf = v.conf
                ? { ...Shema[v.schema], ...v.conf }
                : Shema[v.schema];
      const j = require(`./BOX/yb${conf.$name}.js`);
      return new j.Unit(U, Cls, conf, ...arg);
    }
  }
  U.cleanCash = async () => {
    U.tr3('[BOX] cleanCash');
    return S.CONTAINER().cleanCash();
  };
  U.cleanTrash = async () => {
    U.tr3('[BOX] cleanTrash');
    return S.TRASH().clean();
  }
};
