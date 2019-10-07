'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ybLIST.js';
const ver = `yko/BOX/${my} v191005.01`;
//
module.exports = function (Y, P, DB) {
  this.ver = ver;
	const S = this;
  S.DB = DB;
  S.P  = P;
	S.conf = P.conf.list;
	S.build = (a) => { return new _SCHEMA_(Y, S, a) };
};
function _SCHEMA_ (Y, S, a) {
  const SC = this;
  const TYPE = 'list';
  const ID   = a.id   || Y.throw(ver, 'Unknown id');
  const NAME = a.name || Y.throw(ver, 'Unknown name');
  const SCHEMA = {};
  const ident = S.conf.column.ident;
  let count = 0;
  if (a.schema) {
    if (a.schema.length > S.conf.column.max)
					         Y.throw(ver, 'Column is not acceptable');
    for (let c of a.schema) {
			if (! c[0]) Y.throw(ver, 'Unknown alias');
			SCHEMA[c[0]] = {
        colum: (ident + ++count),
        canon: (c[1] || () => {})
      };
    }
  } else {
    while (++count <= S.conf.column.max) {
      let key = ident + count;
      SCHEMA[key] = { colum: key, canon: () => {} };
    }
  }
  SC.fKey = () =>
      { return { type: TYPE, id: ID, name: NAME } };
  SC.insert = (i) =>
      { return new _BUCKET_(Y, S, SC, SCHEMA, i) };
}
function _BUCKET_(Y, S, SC, SCHEMA, i) {
  const BU = this;
  const Schema = Object.create(SCHEMA);
  if (i) {
    let newd = Object.create(i);
    for (let [k, v] of Object.entries(newd)) {
      if (! Schema[k].canon(v)) Y.throw(ver, 'Invalid data');
      Schema[k].value = v;
      delete newd[k];
    }
    let len = Object.keys(newd).length;
    if (len) Y.throw(ver, `${len} data not processed`);
  }
  let UPDATE;
  BU._reset_ = () => {
    UPDATE = { columns: {} };
    for (let v of Schema)
    { if (v.value || v.value == 0) delete v.value }
  };
  BU.is_update = () =>
    { return Object.keys(UPDATE.columns).length ? true : false };
  BU.aleady = () => { return UPDATE.aleady };
  BU.set = (k, v) => {
    if (! Schema[k]) Y.throw(ver, `'${k}' schema is undefined`);
    if (! Schema[k].canon(v)) Y.throw(ver, `Invalid '${k}'`);
    UPDATE.columns[k] = true;
    return (Schema[k].value = v);
  };
  BU.del = (k) => {
    if (! Schema[k]) Y.throw(ver, `'${k}' schema is undefined`);
    UPDATE.columns[k] = true;
    return (Schema[k].value = undefined);
  };
  const makeKey = (key) => {
    let fkey = {};
    if (key) {
      for (let [k, v] of Object.entries(key))
          { fkey[ Schema[k] ? Schema[k].colum : k ] = v }
    }
    for (let [k, v] of Object.entries(SC.fKey())) { fkey[k] = v }
    return fkey;
  };
  const makeIN = (in) => {
    for (let k in UPDATE.columns) {
      in[ Schema[k].colum ] = (Schema[k].value
          || Schema[k].value == 0) ? Schema[k].value : null;
    }
    if (! UPDATE.aleady) in.timeModify = Y.tool.time_u();
    in.timeChange = Y.tool.time_u();
    return in;
  };
  BU.get = (key) => {
    BU._reset_();
    return new Promise ( rsv => {
      return S.DB.findOne( makeKey(key) ).then( r => {
        if (! r) return rsv({});
        let result = {};
        for (let [k, v] of Object.entries(Schema)) {
          if (r[k] && r[k] != null)
              { v.value = result[k] = r[k] }
        }
        UPDATE.aleady = r._id;
        return rsv(result);
      });
    });
  };
  BU.preper = (key, callback) => {
    if (! BU.is_update()) return false;
    if (UPDATE.aleady) {
      let ID = UPDATE.aleady;
      S.P.regist(o => {
        return S.DB.updateOne({ _id: ID }, makeIN({}))
      });
    } else {
      let in = makeKey(key);
      S.P.regist(o => {
        return S.DB.findOne(in).then( r => {
          if (r) return (true, r);
          return S.DB.insertOne( makeIN(in) )
          .then(o => { BU._reset_() });
        });
      });
    }
  };
  BU._reset_();
}
