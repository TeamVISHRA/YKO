//
// yko/BOX.js
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'BOX.js';
const ver = `yko/${my} v191001.01`;
//
let S, Y;
module.exports = function (y) {
  this.ver = ver;
	[S, Y] = [this, y];
  S.conf = Y.conf.box;
  if (! S.conf.db) Y.throw("'Y.conf.box.db' is undefined");
  const J = require('./BOX/yb' + S.conf.db + '.js');
  const DB = new J (Y, S);
  const POOL = {};
  for (let k of ['CONTAINER', 'LIST', 'TRASH']) {
    S[k] = () => {
      if (POOL[k]) return POOL[k];
      let lib = require(`./BOX/yb${k}.js`);
      POOL[k] = new lib (Y, S, DB);
      return POOL[k];
    };
  }
//  S.list = (a) => {
//    Y.tr1('list');
//    return S.LIST().build(a);
//  };
  S.trash = (a) => {
    Y.tr1('trash');
    return S.TRASH().view(a);
  };
  S.cash = (a) => {
    Y.tr1('cash');
    a.type = 'cash'; return S.CONTAINER().view(a);
  };
  S.data = (a) => {
    Y.tr1('data');
    a.type = 'data'; return S.CONTAINER().view(a);
  };
  S.any = (t, a) => {
    a.type = t; Y.tr1('any', a.type);
    return S.CONTAINER().view(a);
  };
  S.list = (t, a) => {
    a.type = t; Y.tr1('list', a.type);
    return S.CONTAINER().list(a);
  };
  S.cleanCash = async () => {
    Y.tr1('cleanCash');
    return S.CONTAINER().cleanCash();
  };
  S.cleanTrash = async () => {
    Y.tr1('cleanTrash');
    return S.TRASH().clean();
  }
  //
  let PREPERS = [];
  S.regist   = (f) => {
    PREPERS.push(f);
    Y.tr3('regist (' + PREPERS.length + ')');
  };
  S.begin = ()  => {
    Y.tr2('begin');
    PREPERS = [];
  };
  S.rollback = () => {
    Y.tr2('rollback');
    PREPERS = [];
    S.close();
  };
  S.commit = async () => {
    Y.tr2('commit');
    const len = PREPERS.length;
    if (len > 0) {
      Y.tr2(`commit:exec (${len})`);
      let count = 0;
      for (let f of PREPERS) {
        await f().then(o => {
          if (o) Y.tr2(ver, o);
          if (++count >= PREPERS.length) return true;
        });
      }
      return S.begin();
    }
  };
  S.close = () => {
    Y.tr2('close');
    DB.close();
  };
};
