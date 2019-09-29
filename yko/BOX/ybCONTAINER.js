//
// yko/ybCONTAINER.js
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const ver = 'yko/ybCONTAINER.js v190919.01';
//
module.exports = function (Y, P, DB) {
  this.ver = ver;
	const S = this;
  S.conf = P.conf.container;
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
      	.then( r => { rsv( new _BOX_ (Y, P, S, DB, a, r)) });
    });
	};
  S.list = (a) => {
    Y.tr4('list');
    if (! a.type) Y.throw('type unknown.');
    if (! a.id)   Y.throw('id unknown.');
  	return new Promise ( rsv => {
    	return DB.findMeny({ type: a.type, id: a.id })
        .then( r => { rsv( new _LIST_ (Y, P, S, DB, a, r)) });
    });
  };
  S.cleanCash = async () => {
    Y.tr4('cleanCash');
    const Now = Y.tool.time_u();
    let result = await DB.deleteMany({
      type: { $eq: 'cash' },
      timeLimit: { $lt: Now }
    });
    return result;
  };
};
function _LIST_ (Y, P, S, DB, a, r) {
  let LIST = this;
  const TYPE = a.type;
  const ID   = a.id;
  let VALUE;
  if (r && r.length > 0) {
    VALUE = r;
    LIST.hit = () => { return true };
    LIST.ref = () => { return VALUE };
    LIST.export = () => { return Object.create(VALUE) };
    LIST.get = (name) => {
      const box = VALUE.find(o=> o.name == name);
      return box ? new _BOX_ (Y, P, S, DB, a, box) : false;
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
      const box = VALUE.pop();
      if (! box) return false;
      return new _BOX_ (Y, P, S, DB, a, box);
    };
    LIST.unshift = () => {
      const box = VALUE.unshift();
      if (! box) return false;
      return new _BOX_ (Y, P, S, DB, a, box);
    };
  } else {
    LIST.hit = () => { return false };
    VALUE = [];
  }
}
function _BOX_ (Y, P, S, DB, a, r) {
  let BOX = this;
  const T = Y.tool;
  const TYPE = a.type;
  const ID   = a.id;
  const NAME = a.name;
  let [TMP, _ID, VALUE, UNIQUE] = [{}, ''];
  if (r) {
    _ID = r._id;
    VALUE = r.value;
    BOX.timeModify = () => { return r.timeModify };
    BOX.timeChange = () => { return r.timeChange };
    BOX.aleady = () => { return true  };
    BOX.isNew  = () => { return false };
    UNIQUE = { _id: _ID };
  } else {
    VALUE = {};
    BOX.timeModify = BOX.timeChange = () => {
      if (TMP.time) return TMP.time;
      return (TMP.time = T.time_u());
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
  BOX.has = (k) => {
    return (k in VALUE);
  };
  BOX.exist = BOX.has;
  BOX.get = (k) => {
    return VALUE[k];
  };
  BOX.set = (k, v) => {
    BOX.update();
    return VALUE[k] = v;
  };
  BOX.keys = () => {
    return Object.keys(VALUE);
  };
  BOX.json = () => { return T.o2json(VALUE) };
  BOX.inport = (o) => {
    o.__inport__ = true; delete o.__inport__;
    BOX.update();
    return (VALUE = o);
  };
  BOX.export = () => { return Object.create(VALUE) };
  BOX.clone  = BOX.export;
  BOX.ref = () => { return VALUE };
  //
  const _life_ = (n) => {
    let cf = S.conf.cash;
    n = Number(n);
    if (! n) n = Number(cf.default_life);
    if (n > cf.max_life) n = Number(cf.max_life);
    if (n < cf.min_life) n = Number(cf.min_life);
    return T.time_u_add(n);
  };
  BOX.preper = async () => {
    Y.tr3('preper');
    if (! UPDATE) return BOX;
    Y.tr4('preper', 'update true');
    let db = { value: VALUE };
    if (_ID) {
      Y.tr3('preper:update - target', _ID);
      db.timeChange = T.time_u();
      if (TYPE == 'cash') {
        if (BOX.life) db.timeLimit = _life_(BOX.life);
      } else {
        db.timeLimit = false;
      }
      Y.tr5('preper', db);
      P.regist(o => { return DB.updateOne(UNIQUE, db) });
    } else {
      if (! BOX.type
         || BOX.type == 'trash') Y.throw(ver, 'Illegal processing');
      [db.type, db.id, db.name] = [TYPE, ID, NAME];
      db.timeModify = db.timeChange = T.time_u();
      if (TYPE == 'cash') {
        db.timeLimit = BOX.life ? _life_(BOX.life): _life_(0);
      } else {
        db.timeLimit = false;
      }
      Y.tr3('preper:insert');
      Y.tr5('preper', db);
      P.regist(o => { return DB.insertOne(db) });
    }
    UPDATE = false;
    return BOX;
  };
  BOX.commit = async () => {
//    BOX.preper();
    await P.commit().then(o=> { BOX.close() });
    return true;
  };
  BOX.close = () => { BOX = false };
  //
  if (TYPE != 'system')
  _NEXT_COMPONENT_(Y, P, S, DB, BOX, T, TYPE, ID, NAME);
}
function _NEXT_COMPONENT_ (Y, P, S, DB, BOX, T, TYPE, ID, NAME) {
  BOX.inc = (k, n) => {
    BOX.update();
    if (VALUE[k] == undefined) VALUE[k] = 0;
    return (VALUE[k] += Number(n || 1));
  };
  BOX.dec = (k, n) => {
    BOX.update();
    if (VALUE[k] == undefined) VALUE[k] = 0;
    return (VALUE[k] -= Number(n || 1));
  };
  BOX.push = (k, v) => {
    BOX.update();
    if (! VALUE[k]) VALUE[k] = [];
    return VALUE[k].push(v);
  };
  BOX.shift = (k, v) => {
    BOX.update();
    if (! VALUE[k]) VALUE[k] = [];
    return VALUE[k].shift(v);
  };
  BOX.pop = (k) => {
    BOX.update();
    return VALUE[k].pop();
  };
  BOX.unshift = (k) => {
    BOX.update();
    return VALUE[k].unshift();
  };
  BOX.func = (k, f) => {
    return f(VALUE[k]);
  };
  BOX.del = (k) => {
    BOX.update();
    return delete VALUE[k];
  };
  BOX.remove = async () => {
    Y.tr3('remove');
    if (! UNIQUE)
        Y.throw(ver, 'Target data h does not exist.');
    let db = { type: 'trash',
        ago: TYPE, value: VALUE, timeChange: T.time_u() };
    // Equivalent to preper
    P.regist(o => { return DB.updateOne(UNIQUE, db) });
    return BOX;
//    return await P.commit();
  };
}
