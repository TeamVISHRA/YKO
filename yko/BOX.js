'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'BOX.js';
const ver = `yko/${my} v191013.01`;
//
module.exports.init = function (Y, Ref) {
  const S = Y.superKit('box', this, 0, 0, Ref);
  S.ver = ver;
  if (! S.conf.db) Y.throw("'Y.conf.box.db' is undefined");
  const JS = require(`./BOX/yb${S.conf.db}.js`);
  Ref.DBdriver = new JS.init (S);
};
module.exports.Unit = function (R, Ref) {
	const S = R.unitKit('box', this, 0, 0, Ref);
    S.ver = ver;
  const DB = Ref.DBdriver;
  S.DB = () => { return DB };
  const POOL = {};
  for (let k of ['CONTAINER', 'LIST', 'TRASH']) {
    S[k] = () => {
      return POOL[k] || (() => {
        let lib = require(`./BOX/yb${k}.js`);
        return (POOL[k] = new lib.Unit (S));
      })();
    };
  }
//  S.list = (a) => {
//    Y.tr1('list');
//    return S.LIST().build(a);
//  };
  S.trash = (a) => {
    S.tr1('trash');
    return S.TRASH().view(a);
  };
  S.cash = (a) => {
    S.tr1('cash');
    a.type = 'cash'; return S.CONTAINER().view(a);
  };
  S.data = (a) => {
    S.tr1('data');
    a.type = 'data'; return S.CONTAINER().view(a);
  };
  S.any = (t, a) => {
    a.type = t; S.tr1('any', a.type);
    return S.CONTAINER().view(a);
  };
  S.list = (t, a) => {
    a.type = t; S.tr1('list', a.type);
    return S.CONTAINER().list(a);
  };
  S.cleanCash = async () => {
    S.tr1('cleanCash');
    return S.CONTAINER().cleanCash();
  };
  S.cleanTrash = async () => {
    S.tr1('cleanTrash');
    return S.TRASH().clean();
  }
  //
  let PREPERS = [];
  S.regist   = (f) => {
    PREPERS.push(f);
    S.tr3('regist (' + PREPERS.length + ')');
  };
  S.begin = ()  => {
    S.tr2('begin');
    PREPERS = [];
  };
  S.rollback = () => {
    S.tr2('rollback');
    PREPERS = [];
    S.close();
  };
  S.commit = async () => {
    S.tr2('commit');
    const len = PREPERS.length;
    if (len > 0) {
      S.tr2(`commit:exec (${len})`);
      let count = 0;
      for (let f of PREPERS) {
        await f().then(o => {
          if (o) S.tr2(ver, o);
          if (++count >= PREPERS.length) return true;
        });
      }
      return (PREPERS = []);
    }
  };
  S.close = () => {
    S.tr2('close');
    DB.close();
  };
};
