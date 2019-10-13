'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ybMongo.js';
const ver = `yko/BOX/${my} v191013.01`;
//
module.exports.init = function (P) {
	const S = P.superKit('mongodb', this, P.im, P.conf);
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
        S.table = S.collection = S.db.collection(S.conf.collection);
        S.active = true;
        S.tr(`mongodb Connected to ${ver} - ` + S.conf.address);
        return S.table;
      } catch (err) {
        S.throw(`${ver} mongodb connected error`, err);
      }
    }
  };
  S.disconnect = () => {
    S.tr3('disconnect');
    if (S.client) {
      try {
        S.tr3('db close !!');
        S.client.close();
      } catch (err) {
        S.tr('mongodb close error', err);
      }
      S.client = S.db = S.table = S.active = false;
    }
  };
  S.close = S.disconnect;
  //
  S.findOne = (q) => {
    S.tr3('findOne');
    return S.connect().then( t => { return t.findOne(q) });
  };
  S.findMeny = () => {
    S.tr3('findMeny');
    return S.connect().then( t => { return t.findMeny(q) });
  };
  S.insertOne = (d) => {
    S.tr3('insertOne');
    return S.connect().then( t => {
      return t.insertOne(d, e => { if (e) S.throw(ver, e) });
    });
  };
  S.updateOne = (k, d) => {
    S.tr3('updateOne');
    return S.connect().then( t => {
      return t.updateOne(k, { $set: d }, err => {
        if (err) {
          S.throw(ver, { 'Target key': k }, err);
        }
      });
    });
  };
  S.deleteOne = (q) => {
    S.tr3('deleteOne');
    return S.connect().then( t => { return t.deleteOne(q) });
  };
  S.deleteMany = (q) => {
    S.tr3('deleteMany');
    return S.connect().then( t => { return t.deleteMany(q) });
  };
}
