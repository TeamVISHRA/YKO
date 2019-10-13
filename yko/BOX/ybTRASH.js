'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ybTRASH.js';
const ver = `yko/BOX/${my} v191013.01`;
//
const TYPE = 'trash';
//
module.exports.Unit = function (Y, P, DB) {
  this.ver = ver;
	const S = this;
	S.view = (a) => {
    if (! a.id)   Y.throw(ver, 'id unknown.');
    if (! a.name) Y.throw(ver, 'name unknown.');
    return new Promise ( resolve => {
      return DB.findOne
        ({ type: TYPE, id: a.id, name: a.name })
        .then( r => { resolve( new _TRASH_ (Y, S, DB, a, r)) });
    });
	}
  S.clean = async () => {
    const Comp = Y.tool.unix_add(-10, 'd');
    let result = await DB.deleteMany({
      type: { $eq: TYPE },
      timeChange: { $lt: Comp }
    });
    return result;
  };
};
function _TRASH_ (Y, S, DB, a, r) {
  let TRA = this;
  if (r) {
    TRA.export = () => { return Y.tool.clone(r.value) };
    TRA.remove = () => {
      return new Promise ( resolve => {
        S._prepers_.push
        (o => { return DB.deleteOne({ _id: r._id }) });
        S.commit(o => { return resolve( TRA.close() ) });
      });
    };
    TRA.undo = () => {
      return new Promise ( resolve => {
        return DB.findOne({ type: r.ago, id: r.id, name: r.name })
        .then( result => {
          if (result) {
            TRA.close();
            return resolve({ data: result,
              error: 'There is already active data' });
          }
          DB.updateOne({ _id: r._id }, { ago: false, type: r.ago })
          .then(o => {
            TRA.close();
            return resolve({ success: true });
          });
        });
      });
    };
  } else {
    TRA.export = () => {};
  }
  TRA.aleady = () => { return r ? true : false };
  TRA.close  = () => { TRA = false };
}
