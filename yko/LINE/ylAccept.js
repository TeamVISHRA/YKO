'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'yLINE.js';
const ver = `yko/${my} v191108`;
//
module.exports.Unit = function (P) {
  const A = P.root.unitKit('accept', this, P);
    A.ver = ver;
    A.log = log;
 A.events = {
    message: message
  };
  function message (json) {
    return new Promise (async resolve => {
      const Soc = json.source;
      const Msg = json.message;
      if (Soc && Msg) {
        const From =
        (Soc.type == 'user') ? Soc.userId: Soc[`${Soc.type}Id`];
        await P.responce.toDiscord
        (Msg.type, From, Soc.userId, json).then(cd=> resolve(cd));
      } else {
        await log('report', json).then(cd=> resolve(cd));
      }
    });
  }
  function log (status, json) {
    return new Promise (async resolve => {
      await A.root.box.log('Line', (status || 'use'))
                  .add(json).then(x=> resolve([200]));
    });
  }
};
