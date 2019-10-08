'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'yCRON.js';
const ver = `yko/${my} v191008.01`;
//
module.exports.Super = function (Y, Ref) {
  Y.throw(`I will not be Super !!`);
};
module.exports.onFake = function (Y, Ref) {
  const RUN = Y.rack.get('RUNNERS');
  if (RUN.CRON) delete RUN.CRON;
};
module.exports.Unit = function (Y, R, Ref) {
  const U = this;
    U.ver = `${my} :U`;
   U.conf = Y.conf.cron;
     U.im = Y.im.cron;
   U.root = R;
    U.Ref = Ref;
  const Jobs = require(`./CRON/ycJOBS.js`);
  const J = new Jobs (Y, U);
  U.Jobs = (name, ...a) => { J[name](a) };
};
module.exports.init = function (Y, Ref) {
  const S = this;
    S.ver = `${ver} :S`;
   S.conf = Y.conf.cron;
     S.im = Y.im.cron;
  init(Y, S, Ref); 
};
function init (Y, S, Ref) {
  if (Y.debug() && S.im.sleep) return;
  const T = Y.tool;
  const CRON = {
    count: 0,
    M: { name: 'month',  value: T.time_form(0, 'M') },
    D: { name: 'day',    value: T.time_form(0, 'D') },
    H: { name: 'hour',   value: T.time_form(0, 'H') },
    m: { name: 'minute', value: T.time_form(0, 'm') }
  };
  const ON = Y.rack.get('ON');
  for (let [k, v] of T.e(CRON)) {
    let key = 'cron_' + (typeof v == 'object' ? v.name : k);
    if (! ON[key]) ON[key] = () => {};
  }
  const JOB = () => {
    const Now = {
      count: ++CRON.count,
      M: T.time_form(0, 'M'),
      D: T.time_form(0, 'D'),
      H: T.time_form(0, 'H'),
      m: T.time_form(0, 'm')
    };
    const START = (name, args) => {
      let R;
      Y.start(ver).then( unitRoot => {
        R = unitRoot;
        R.CRON.Jobs(name, args);
      }).catch ( e => {
        let v;
        if (R) { R.rollback(); v = R.ver }
        Y.throw((v || S.ver), e);
      });
    };
    try {
      for (let [k, v] of T.e(Now)) {
        if (typeof CRON[k] == 'object') {
          if (CRON[k].value != v) {
            ON['cron_' + CRON[k].name](START, v, Now);
            CRON[k].value = v;
            Y.tr1(CRON[k].name, v);
          }
        } else {
          ON['cron_' + k](START, v, Now);
          Y.tr1(k, v);
        }
      }
      if (Now.count >= S.conf.count.max) CRON.count = 0;
    } catch (err) {
      Y.tr(ver, err);
    };
  };
  let ClearToken;
  Y.runners('CRON', ()=> {
    if (! S.conf.interval)
        Y.throw(ver, "'interval' is not defined");
    if (ClearToken) clearInterval(ClearToken);
    Y.tr(`[[[ Start CRON ]]]`);
    ClearToken = setInterval(JOB, S.conf.interval);
  });
}
