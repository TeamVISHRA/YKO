'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'yCRON.js';
const ver = `yko/${my} v191014.01`;
//
const defaultInterval = 3000;
//
module.exports.Super = function (Y, Ref) {
  Y.throw(`I will not be Super !!`);
};
module.exports.Unit = function (R, Ref) {
  const U = R.unitKit('cron', this, R, Ref);
  U.ver = `${ver} :U`;
  U.Jobs = Worker(U);
};
module.exports.onFake = function (Y, Ref) {
  Y.tr3(`[CRON] exports.onFake`);
  onFake(Y);
};
module.exports.init = function (Y, Ref) {
  const S = Y.superKit('cron', this, Y, Ref);
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
            S.tr5(`[CRON] ${CRON[k].name}`, v);
          }
        } else {
          ON['cron_' + k](START, v, Now);
          S.tr5(`[CRON] ${k}`, v);
        }
      }
      if (Now.count >= S.conf.count.max) CRON.count = 0;
    } catch (err) {
      S.tr(`[CRON] Warning`, err);
    };
  };
  let ClearToken;
  S.runners('CRON', ()=> {
    const Iv = S.conf.interval || defaultInterval;
    if (ClearToken) clearInterval(ClearToken);
    S.tr(`[CRON] started !! interval:${Iv}`);
    ClearToken = setInterval(JOB, Iv);
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
  const RUN = Y.rack.get('RUNNERS');
  if (RUN.CRON) delete RUN.CRON;
}
