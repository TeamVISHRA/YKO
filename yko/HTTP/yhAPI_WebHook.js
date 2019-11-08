'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'yhAPI_WebHook.js';
const ver = `yko/HTTP/${my} v191017`;
//
module.exports.Unit = function (P) {
  const S = P.root.unitKit(my, this, P);
  S.run = (url) => {
    return new Promise ((resolve, reject) => {
      if (url.match(/^\/[^\/]+\/(\d+)\/([^\/]+)/)) {
        let [id, token] = [RegExp.$1, RegExp.$2];
        P.parseBODY().then( body => {
          return resolve({
            type: 'discord',
            code: [id, token],
            body: (body || `{ "empty" : true }`)
          });
        }).catch(e=> { return reject(e) });
      } else {
        P.responceNotFound();
        return reject(false);
      }
    }).catch(err => {
      if (err) S.tr(`[HTTP] ${my}`, err);
      if (! S.finished) S.responceForbidden();
      
    });
  };
}
