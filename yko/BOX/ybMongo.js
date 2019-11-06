'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ybMongo.js';
const ver = `yko/BOX/${my} v191107`;
//
const Mongo = require('mongodb').MongoClient;
//
module.exports.init = function (P) {
	const S = P.superKit('mongodb', this, P);
  S.ver = ver;
  if (! S.conf.address)
        S.throw(`[Mongo] 'address' setting is empty.`);
  if (! S.conf.dbName)
        S.throw(`[Mongo] 'dbName' setting is empty.`);
  const Cls = S.conf.collections;
  if (! Cls) S.throw(`[Mongo] 'collections' setting is empty.`);
  let Client, DB, POOL = P.tool.c(null);
  S.collections = () => { return Cls };
  S.connect = () => {
    return new Promise ( async resolve => {
      if (DB) return resolve(DB);
      try {
        Client = await Mongo.connect(S.conf.address, {
          useNewUrlParser    : true,
          useUnifiedTopology : true
        });
        S.tr(`[Mongo] !! Connected !!`,
                         S.conf.dbName, S.conf.address);
        resolve(DB = S.DB = Client.db(S.conf.dbName));
      } catch (err) {
        S.throw(`[Mongo] Connected Error !!`, err);
      }
    });
  };
  S.disconnect = () => {
    S.tr('[Mongo] !! disconnect !!');
    if (Client) {
      try {
        Client.close();
      } catch (err) {
        S.tr('[Mongo] Warning: disconnect error', err);
      }
      Client = DB = S.DB = null;
      POOL = P.tool.c(null);
    }
  };
  S.collection = (name) => {
    return POOL[name] || (() => {
      if (! Cls[name])
          S.throw(`[Mongo] '<collections>.${name}' is empty.`);
      return (POOL[name] = new Collection(S, name, Cls[name]));
    }) ();
  }
}
function Collection (S, name, cn) {
  const C = S.superKit(name, this, S);
  if (! cn.name)
        C.throw(`[Mongo] '<C>.<${name}>.name' is empty.`);
  let Bind;
  const Connect = () => {
    return new Promise (async resolve => {
      if (Bind) return resolve(Bind);
      await S.connect()
          .then(db=> Bind = db.collection(cn.name));
      C.tr4(`[Mongo:Collection] Binding with '${cn.name}'`);
      return resolve(Bind);
    });
  };
  C.disconnect = S.disconnect;
  C.schema = () => { return cn.schema };
  //
  C.findOne = (q) => {
    C.tr3('[Mongo] findOne');
    return Connect().then(c=> { return c.findOne(q) });
  };
  C.findMeny = (q) => {
    C.tr3('[Mongo] findMeny');
    return Connect().then(c=> { return c.findMeny(q) });
  };
  C.insertOne = (d) => {
    C.tr3('[Mongo] insertOne');
    return Connect().then(c=> {
      return c.insertOne(d, e => {
        if (e) C.throw(`[Mongo] Error`, e);
      });
    });
  };
  C.updateOne = (k, d) => {
    C.tr3('[Mongo] updateOne');
    return Connect().then(c=> {
      return c.updateOne(k, { $set: d }, e => {
        if (e) C.throw(`[Mongo] Target:${k}`, e);
      });
    });
  };
  C.deleteOne = (q) => {
    C.tr3('[Mongo] deleteOne');
    return Connect().then(c=> { return c.deleteOne(q) });
  };
  C.deleteMany = (q) => {
    C.tr3('[Mongo] deleteMany');
    return Connect().then(c=> { return c.deleteMany(q) });
  };
}
