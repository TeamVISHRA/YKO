'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ybCONTAINER.js';
const ver = `yko/BOX/${my} v191011.01`;
//
module.exports = function (Y, P, DB) {
   const S = this;
     S.ver = ver;
    S.conf = P.conf.container;
  S.parent = P;
      S.DB = DB;
	 const T = Y.tool;
	S.view = (a) => {
    Y.tr4('view');
    if (! a.type) Y.throw('type unknown.');
    if (! a.id)   Y.throw('id unknown.');
    if (! a.name) Y.throw('name unknown.');
    if (a.type == 'trash'
		 || a.type == 'list') Y.throw(ver, 'Illegal call');
  	return new Promise ( rsv => {
    	return DB.findOne
      	({ type: a.type, id: a.id, name: a.name })
      	.then( r => { rsv( new BOX(Y, S, a, r, T)) });
    });
	};
  S.list = (args) => {
    Y.tr4('list');
    if (! args.type) Y.throw('type unknown.');
    if (! args.id)   Y.throw('id unknown.');
  	return new Promise ( rsv => {
    	return DB.findMeny({ type: args.type, id: args.id })
      .then( list => { rsv( new LIST(Y, S, args, list, T)) });
    });
  };
  S.cleanCash = async () => {
    Y.tr4('cleanCash');
    const Now = T.unix();
    let result = await DB.deleteMany({
      type: { $eq: 'cash' },
      timeLimit: { $lt: Now }
    });
    return result;
  };
};
function LIST (Y, S, Args, list, T) {
  let LIST = this;
  const TYPE = Args.type;
  const ID   = Args.id;
  let VALUE;
  if (list && list.length > 0) {
    VALUE = list;
    LIST.hit = () => { return true };
    LIST.ref = () => { return VALUE };
    LIST.export = () => { return T.clone(VALUE) };
    LIST.get = (name) => {
      const db = VALUE.find(o=> o.name == name);
      return db ? new BOX (args, db) : false;
    };
    LIST.list = (col) => {
      const result = [];
      let VL;
      if (col) {
        VL = (typeof col == 'object') ? (v) => {
          const hs = ['name', v.name];
          for (let k of col) { hs.push([k, v[k]]) }
          return hs;
        }: (v) => {
          return [['name', v.name], [col, v[col]]];
        };
      } else { VL = () => { return v.name } }
      for (let v of VALUE) { result.push( VL(v) ) }
      return new Map(result);
    };
    LIST.remove = (uid) => {
      const box = LIST.get(name);
      if (! box) return false;
      box.remove();
      return true;
    };
    LIST.bulkDelete = (list) => {
      let count = 0;
      for (let name of list)
          { if (LIST.delete(name)) ++count }
      return count;
    };
    LIST.pop = () => {
      const db = VALUE.pop();
      if (! db) return false;
      return new BOX (Args, db);
    };
    LIST.unshift = () => {
      const db = VALUE.unshift();
      if (! db) return false;
      return new BOX (Args, db);
    };
  } else {
    LIST.hit = () => { return false };
    VALUE = [];
  }
}
function BOX (Y, S, Args, Db, T) {
  const BOX = this,
       TYPE = Args.type,
         ID = Args.id,
       NAME = Args.name;
  let TMP = {}, _ID = '';
  let VALUE, UNIQUE;
  if (Db) {
    _ID = Db._id;
    VALUE = Db.value;
    BOX.timeModify = () => { return Db.timeModify };
    BOX.timeChange = () => { return Db.timeChange };
    BOX.aleady = () => { return true  };
    BOX.isNew  = () => { return false };
    UNIQUE = { _id: _ID };
  } else {
    VALUE = {};
    BOX.timeModify = BOX.timeChange = () => {
      if (TMP.time) return TMP.time;
      return (TMP.time = T.unix());
    };
    BOX.aleady = () => { return false };
    BOX.isNew  = () => { return true  };
    UNIQUE = false;
  }
  BOX._ID  = () => { return _ID  };
  BOX.type = () => { return TYPE };
  BOX.id   = () => { return ID   };
  BOX.name = () => { return NAME };
  let UPDATE = false;
  BOX.update = (n) => { return (UPDATE = true) };
  BOX.isUpdate = () => { return UPDATE ? true : false };
	//
  BOX.has = (key) => {
    return (key in VALUE);
  };
  BOX.exist = BOX.has;
  BOX.get = (key) => {
    return VALUE[key];
  };
  BOX.set = (key, value) => {
    BOX.update();
    return VALUE[key] = value;
  };
  BOX.keys = () => {
    return T.k(VALUE);
  };
  BOX.json = () => { return T.o2json(VALUE) };
  BOX.inport = (obj) => {
    obj.__inport__ = true; delete obj.__inport__;
    BOX.update();
    return (VALUE = obj);
  };
  BOX.export = () => { return T.clone(VALUE) };
  BOX.clone  = BOX.export;
  BOX.ref = () => { return VALUE };
  //
  const TTL = (n) => {
    let cf = S.conf.cash;
    n = Number(n);
    if (! n) n = Number(cf.default_TTL);
    if (n > cf.max_TTL) n = Number(cf.max_TTL);
    if (n < cf.min_TTL) n = Number(cf.min_TTL);
    return T.unix_add(n);
  };
  BOX.preper = async () => {
    Y.tr3('preper');
    if (! UPDATE) return BOX;
    Y.tr4('preper', 'update true');
    let db = { value: VALUE };
    if (_ID) {
      Y.tr3('preper:update - target', _ID);
      db.timeChange = T.unix();
      if (TYPE == 'cash') {
        if (BOX.TTL) db.timeLimit = TTL(BOX.TTL);
      } else {
        db.timeLimit = false;
      }
      Y.tr5('preper', db);
      S.parent.regist(o => { return S.DB.updateOne(UNIQUE, db) });
    } else {
      if (! BOX.type
         || BOX.type == 'trash') Y.throw(ver, 'Illegal processing');
      [db.type, db.id, db.name] = [TYPE, ID, NAME];
      db.timeModify = db.timeChange = T.unix();
      if (TYPE == 'cash') {
        db.timeLimit = BOX.TTL ? TTL(BOX.TTL): TTL(0);
      } else {
        db.timeLimit = false;
      }
      Y.tr3('preper:insert');
      Y.tr7('preper', db);
      S.parent.regist(o => { return S.DB.insertOne(db) });
    }
    UPDATE = false;
    return BOX;
  };
  BOX.commit = async () => {
//    BOX.preper();
    await S.parent.commit().then(o=> { BOX.close() });
    return true;
  };
  BOX.close = () => { BOX = false };
  //
  if (TYPE != 'system') {
    BOX.inc = (key, n) => {
      BOX.update();
      if (VALUE[key] == undefined) VALUE[key] = 0;
      return (VALUE[key] += Number(n || 1));
    };
    BOX.dec = (key, n) => {
      BOX.update();
      if (VALUE[key] == undefined) VALUE[key] = 0;
      return (VALUE[key] -= Number(n || 1));
    };
    BOX.push = (key, v) => {
      BOX.update();
      if (! VALUE[key]) VALUE[key] = [];
      return VALUE[key].push(v);
    };
    BOX.shift = (key, v) => {
      BOX.update();
      if (! VALUE[key]) VALUE[key] = [];
      return VALUE[key].shift(v);
    };
    BOX.pop = (key) => {
      BOX.update();
      return VALUE[key].pop();
    };
    BOX.unshift = (key) => {
      BOX.update();
      return VALUE[key].unshift();
    };
    BOX.func = (key, f) => {
      return f(VALUE[key]);
    };
    BOX.del = (key) => {
      return
      (! VALUE[key] && VALUE[key] != 0) ? false : (() => {
        BOX.update();
        return delete VALUE[key];
      }) ();
    };
    BOX.remove = async () => {
      Y.tr3('remove');
      if (! UNIQUE)
          Y.throw(ver, 'Target data h does not exist.');
      let db = { type: 'trash',
          ago: TYPE, value: VALUE, timeChange: T.unix() };
      // Equivalent to preper
      S.parent.regist(o => { return DB.updateOne(UNIQUE, db) });
      return BOX;
//      return await P.commit();
    };
  }
}
