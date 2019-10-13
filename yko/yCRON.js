'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'yCRON.js';
const ver = `yko/${my} v191013.01`;
//
module.exports.Super = function (Y, Ref) {
  Y.throw(`I will not be Super !!`);
};
module.exports.Unit = function (R, Ref) {
  const U = R.unitKit('cron', this, 0, 0, Ref);
  U.ver = `${ver} :U`;
  U.Jobs = Worker(U);
};
module.exports.onFake = function (Y, Ref) {
  onFake(Y);
};
module.exports.init = function (Y, Ref) {
  const S = Y.superKit('cron', this, 0, 0, Ref);
  S.ver = `${ver} :I`;
  init(S);
};
module.exports.START = function (S) {
  return (name, args) => {
    let R;
    S.start(`${name} (${ver})`).then( unitRoot => {
      R = unitRoot;
      R.CRON.Jobs(name, args);
    }).catch ( e => {
      let v;
      if (R) { R.rollback(); v = R.ver }
      S.throw((v || S.ver), e);
    });
  };
}
function init (S) {
  if (S.debug() && S.im.sleep) return;
  const T = S.tool;
  const CRON = {
    count: 0,
    M: { name: 'month',  value: T.time_form(0, 'M') },
    D: { name: 'day',    value: T.time_form(0, 'D') },
    H: { name: 'hour',   value: T.time_form(0, 'H') },
    m: { name: 'minute', value: T.time_form(0, 'm') }
  };
  const ON = S.rack.get('ON');
  for (let [k, v] of T.e(CRON)) {
    let key = 'cron_' + (typeof v == 'object' ? v.name : k);
    if (! ON[key]) ON[key] = () => {};
  }
  const START = exports.START(S);
  const JOB = () => {
    const Now = {
      count: ++CRON.count,
      M: T.time_form(0, 'M'),
      D: T.time_form(0, 'D'),
      H: T.time_form(0, 'H'),
      m: T.time_form(0, 'm')
    };
    try {
      for (let [k, v] of T.e(Now)) {
        if (typeof CRON[k] == 'object') {
          if (CRON[k].value != v) {
            ON['cron_' + CRON[k].name](START, v, Now);
            CRON[k].value = v;
            S.tr5(CRON[k].name, v);
          }
        } else {
          ON['cron_' + k](START, v, Now);
          S.tr5(k, v);
        }
      }
      if (Now.count >= S.conf.count.max) CRON.count = 0;
    } catch (err) {
      S.tr(ver, err);
    };
  };
  let ClearToken;
  S.runners('CRON', ()=> {
    if (! S.conf.interval)
        S.throw(ver, "'interval' is not defined");
    if (ClearToken) clearInterval(ClearToken);
    S.tr(`[Start] YKO CRON !!`);
    ClearToken = setInterval(JOB, S.conf.interval);
  });
}
function Worker (U) {
  let Wk;
  return (name, ...a) => {
    if (! Wk) {
      const JS = require(`./CRON/ycJOBS.js`);
      Wk = new JS.Unit (U);
    }
    Wk[name](...a);
  };
}
function onFake (Y) {
  Y.tr3(`${my} >> onFake !!`);
  const RUN = Y.rack.get('RUNNERS');
  if (RUN.CRON) delete RUN.CRON;
}
