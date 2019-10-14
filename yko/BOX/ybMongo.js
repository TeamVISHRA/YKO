'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ybMongo.js';
const ver = `yko/BOX/${my} v191014.01`;
//
module.exports.init = function (P) {
	const S = P.superKit('mongodb', this, P);
  S.ver = ver;
  S.connect = async () => {
    if (S.table) {
      return S.table;
    } else {
      S.J = require('mongodb').MongoClient;
      try {
        S.client = await S.J.connect(S.conf.address, {
          useNewUrlParser    : true,
          useUnifiedTopology : true
        });
        S.db = S.client.db(S.conf.dbName);
        S.table =
        S.collection = S.db.collection(S.conf.collection);
        S.active = true;
        S.tr(`[BOX:DB:mongo] Connected:${S.conf.address}`);
        return S.table;
      } catch (err) {
        S.throw(`[BOX:DB:mongo] Connected error`, err);
      }
    }
  };
  S.disconnect = () => {
    S.tr3('[BOX:DB:mongo] disconnect');
    if (S.client) {
      try {
        S.client.close();
      } catch (err) {
        S.tr('[BOX:DB:mongo] close error', err);
      }
      S.client = S.db = S.table = S.active = false;
    }
  };
  S.close = S.disconnect;
  //
  S.findOne = (q) => {
    S.tr3('[BOX:DB:mongo] findOne');
    return S.connect().then( t => { return t.findOne(q) });
  };
  S.findMeny = () => {
    S.tr3('[BOX:DB:mongo] findMeny');
    return S.connect().then( t => { return t.findMeny(q) });
  };
  S.insertOne = (d) => {
    S.tr3('[BOX:DB:mongo] insertOne');
    return S.connect().then( t => {
      return t.insertOne(d, e => { if (e) S.throw(ver, e) });
    });
  };
  S.updateOne = (k, d) => {
    S.tr3('[BOX:DB:mongo] updateOne');
    return S.connect().then( t => {
      return t.updateOne(k, { $set: d }, err => {
        if (err) {
    S.throw(`[BOX:DB:mongo] ${ver}`, { 'Target key': k }, err);
        }
      });
    });
  };
  S.deleteOne = (q) => {
    S.tr3('[BOX:DB:mongo] deleteOne');
    return S.connect().then( t => { return t.deleteOne(q) });
  };
  S.deleteMany = (q) => {
    S.tr3('[BOX:DB:mongo] deleteMany');
    return S.connect().then( t => { return t.deleteMany(q) });
  };
}
