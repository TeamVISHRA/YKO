'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ybTRASH.js';
const ver = `yko/BOX/${my} v191024`;
//
const DefaultLimit = 0 - (15* (24* 60)); // minute.
//
module.exports.Unit = function (P) {
  const S = P.root.unitKit('TRASH', this, P);
    S.ver = ver;
  const T = S.tool,
       DB = S.root.box.DB();
  S.clean = async () => {
    const Limit = T.unix_add(DefaultLimit, 'm');
    for (let [key, v] of T.e(DB.collections())) {
      const Cls = DB.collection(key);
      await Cls.deleteMany({ $and: [
        { timeTrash: { $exists: true  } },
        { timeTrash: {     $lt: Limit } }
      ]});
    }
    return true;
  };
}
