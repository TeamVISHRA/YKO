//
// yko/yCRON.js
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'yCRON.js';
const ver = `yko/${my} v191001.01`;
//
let S, Y, T;
module.exports = function (y) {
  this.ver = ver;
  [S, Y, T] = [this, y, y.tool];
	S.conf = Y.conf.cron;
  S.im = Y.im.cron;
	S.init = () => {
    Y.tr4('init');
		if (Y.REQ1() == 'Discord') {
      if (! (Y.debug() && S.im.debug_sleep)) {
        build_component();
      }
		}
	};
};
function FINISH (X, comp) {
  if (X.tmp.$START) {
    if (comp && comp.Promise) {
      comp.then(o=> { X.finish() })
          .catch(e=> { X.rollback(); X.throw(ver, e) });
    } else {
      X.finish();
  } }
};
function build_component () {
  Y.tr4('build_component');
  S.Job = (name, args) => {
    const JS = require(`./CRON/yc${name}.js`);
    Y.start(name).then( X => {
      Y.tr2('>>> Start Job', `${name}:${X.ver}`);
      const Comp = new JS (Y, S, args);
//      FINISH(X, Comp.run(X) );
      Comp.run(X)
      .catch(e=> { X.rollback(); X.throw(ver, e) });
    });
  };
  S.exec = (label, func) => {
    Y.start(label).then( X => {
      Y.tr2('>>> Start exec', `${label}:${X.ver}`);
      FINISH(X, func(X) );
    });
  };
  const CRON = {
    count: 0,
    M: { name: 'month',  value: T.time_form(0, 'M') },
    D: { name: 'day',    value: T.time_form(0, 'D') },
    H: { name: 'hour',   value: T.time_form(0, 'H') },
    m: { name: 'minute', value: T.time_form(0, 'm') },
  };
  const ON = Y.ON();
	for (let [k, v] of Object.entries(CRON)) {
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
    try {
      for (let [k, v] of Object.entries(Now)) {
        if (typeof CRON[k] == 'object') {
          if (CRON[k].value != v) {
            ON['cron_' + CRON[k].name](S, v, Now);
            CRON[k].value = v;
            Y.tr1(CRON[k].name, v);
          }
        } else {
          ON['cron_' + k](S, v, Now);
          Y.tr1(k, v);
        }
      }
      if (Now.count >= S.conf.count.max) CRON.count = 0;
		} catch (err) {
			Y.throw(ver, err);
		};
	};
	Y.runners(()=> {
    let ClearToken;
    if (! S.conf.interval)
        Y.throw(ver, "'interval' is not defined");
    if (ClearToken) clearInterval(ClearToken);
    Y.tr(`[[[ Start CRON ]]]`);
    ClearToken = setInterval(JOB, S.conf.interval);
  });
}
