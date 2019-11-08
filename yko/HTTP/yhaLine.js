'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'yhaLine.js';
const ver = `yko/HTTP/${my} v191108`;
//
module.exports.Unit = function (P) {
  const U = P.root.unitKit(my, this, P);
  if (! U.rack.has('LINE'))
    U.throw(`[HTTP:Line] 'LINE' function disabled.`);
  const T = U.tool,
     Line = U.root.LINE;
  U.run = (is) => {
    U.tr3(`[HTTP:Line] run`, is);
    switch (is.cmd) {
      case 'WH':
        webhook(is);
        break;
      default:
        P.responceNotFound();
        break;
    }
  };
  function hasToken (token) {
    return (token && Line.conf.webhook[token]) ? true: false;
  }
  function webhook (is) {
    if (! hasToken(is.token))
        return P.responceAny(406); // Not Acceptable.
    P.parseJSON().then(D => {
      if (D.error) return P.responceError
          ({ errorBody: T.Zcut(D.error, 100) });
      if (! D.json) return P.responceAny(411); // Length Required.
      P.DerayFinish().responceSuccess();
      let rd;
      if (rd = D.json.events) {
        for (let v of rd) {
          if (v.type) {
            try {
              Line.accept[v.type](P, v).then(cd=> P.absFinish(cd));
              continue;
            } catch (e) {
              U.tr(`[HTTP:Line]`, e);
            }
          }
          Line.accept.log(P, v).then(cd=> P.absFinish(cd));
        }
      } else {
        Line.accept.log(P, v).then(cd=> P.absFinish(cd));
      }
    })
    .catch(e=> {
      if (T.isHashArray(e) && e.overFlow) {
        U.tr(`[HTTP:Line] parse - Upper limit of reception.`);
      } else {
        U.throw(`[HTTP:Line]`, e);
      }
    });
  }
}
