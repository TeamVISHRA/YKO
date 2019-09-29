//
// yko/BOX/ybMongo.js
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ybMongo.js';
const ver = `yko/BOX/${my} v190928.01`;
//
module.exports = function (Y, P) {
	this.ver = ver;
	const S = this;
	S.conf = P.conf.mongodb;
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
      	Y.c(`mongodb Connected to ${ver} - ` + S.conf.address);
      	return S.table;
			} catch (err) {
				Y.throw(`${ver} mongodb connected error`, err);
			}
    }
	};
	S.disconnect = () => {
		Y.tr1('disconnect');
		if (S.client) {
			try {
				Y.tr2('db close !!');
				S.client.close();
			} catch (err) {
				Y.tr('mongodb close error', err);
			}
			S.client = S.db = S.table = S.active = false;
		}
	};
	S.close = S.disconnect;
	//
	S.findOne = (q) => {
		Y.tr1('findOne');
		return S.connect().then( t => { return t.findOne(q) });
	};
	S.findMeny = () => {
		Y.tr1('findMeny');
		return S.connect().then( t => { return t.findMeny(q) });
	};
	S.insertOne = (d) => {
		Y.tr1('insertOne');
		return S.connect().then( t => {
			return t.insertOne(d, e => { if (e) Y.throw(ver, e) });
		});
	};
	S.updateOne = (k, d) => {
		Y.tr1('updateOne');
		return S.connect().then( t => {
			return t.updateOne(k, { $set: d }, err => {
				if (err) { Y.c(err);
					Y.tr({ 'Target key': k });
					Y.throw(ver, 'Unexpected error');
				}
			});
		});
	};
	S.deleteOne = (q) => {
		Y.tr1('deleteOne');
		return S.connect().then( t => { return t.deleteOne(q) });
	};
	S.deleteMany = (q) => {
		Y.tr1('deleteMany');
		return S.connect().then( t => { return t.deleteMany(q) });
	};
}
