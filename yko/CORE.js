'use strict'; 
//
// yko/CORE.js - Ver:5.110
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'CORE.js';
const ver = `yko/${my} v191124`;
//
const T = new (require('./TOOL.js'));
//
let Config;
module.exports = function (ARGS) {
	const Y = this;
	[Y.ver, Y.un, Y.exit] = [ver, Y, process.exit];
  if (! ARGS) ARGS = Object.create(null);
  const [,, ...ARGV] = process.argv;
  if (ARGV.length > 0) Y.ARGV = new LaunchUtil(Y, ARGV);
  Y.tool = T.init(Y);
  Y.conf = require(Config || ARGS.config || '../y-config.js');
  if (Y.conf.location.toLowerCase() == 'devel') {
    Y.debug = () => { return true };
    Y.c = console.log;
    Y.log = Logger(Y.c);
  } else {
    const config = Y.conf.log4js || (() => {
      const LogName = ARGS.log
          ? `Y-${ARGS.log}.log`: 'YKO.log';
      return {
        appenders: { debug: {
              type: 'file',
          filename: `./log/${LogName}`,
           pattern: 'YYYYMMDD'
        } },
        categories: { default: {
          appenders: ['debug'],
              level: 'all'
      } } };
    }) ();
    Y.debug = () => { return false };
    const log4js = require('log4js');
    log4js.configure(config);
    Y.log = log4js.getLogger('debug');
    Y.c = (s) => { Y.log.trace(s) };
  }
      Y.tr = Trace(Y);
   Y.throw = Throw(Y);
   Y.TRACE = $TRACE_;
   Y.STACKTRACE = () => { return $TRACE_(new Error().stack, 3) };
  const Lv = initDebugLv(Y);
  Y.tr1('[CORE] debug_level', Lv);
  const Gd = Y.rack = new Map([
    ['CASH',    {}],
    ['START',   []],
    ['ROLLBACK',[]],
    ['FINISH',  []],
    ['ON',      {}],
    ['RUNNERS', {}],
    ['REQUIRES',[]]
  ]);
  for (let name of ['WEB', 'SYSDATA', 'BRAIN', 'BOX']) {
    const low = name.toLowerCase();
    Gd.set(low, {
      $JS: require(`./${name}.js`),
      $args: ARGS[low]
    });
  }
  Gd.get('sysdata').CASH = T.c(null);
  //
  Y.on = (key, ...arg) => {
    if ( key.match(/^start$/i)
      || key.match(/^rollback$/i)
      || key.match(/^finish$/i)) {
      Gd.get(key.toUpperCase()).push(arg[0]);
    } else if ( key.match(/^cash$/i)
             || key.match(/^runners$/i)) {
      Gd.get(key.toUpperCase())[arg[0]] = arg[1];
    } else {
      Gd.get('ON')[key.toLowerCase()] = arg[0];
    }
  };
  let ENGINE = () => { Y.tr('??? (?o?) hoe ...!?') };
   Y.runners = () => { return Gd.get('RUNNERS') };
    Y.engine = (func) => { ENGINE = func };
       Y.run = async () => { return ENGINE() };
      Y.Next = () => {};
  Y.baseRD = (jsName) => {
    let [, key] = jsName.match(/^[a-z]+([A-Z].+)$/);
    return {
        $JS: require(`./${jsName}.js`),
      $name: key,
       $low: key.toLowerCase(),
      $unit: () => {},
    $onFake: () => {}
    };
  };
  let MAIN;
  let Super = (X) => { return X };
  Y.init = (...setup) => {
    if (setup[0] && setup[0].match(/\S+\s+\S+/)) {
      setup = setup[0].split(/\s+/);
    }
    const REQ = Gd.get('REQUIRES');
    const Regist = (name) => {
      let result = Y.baseRD(name);
      result.$args = ARGS[result.$low];
      Gd.set(result.$name, result);
      REQ.push(result.$name);
      return result;
    };
    let Add = '';
    if (MAIN = setup.shift()) {
      MAIN = Regist(MAIN);
      Y[MAIN.$name] = new MAIN.$JS.Super (Y, MAIN);
      Super = (X) => { X.super = Y[MAIN.$name]; return X }
      Add = ` ${MAIN.$name} -`;
      Unn.push(MAIN.$name);
      Gd.set('MAIN', MAIN);
    }
    for (let name of setup) { Regist(name) }
    for (let key of T.v(REQ).reverse()) {
      if (Y[key]) {
        Y[key].init();
      } else {
        const Ref = Gd.get(key);
        Ref.$JS.init(Y, Ref);
      }
    }
    for (let j of ['brain', 'box']) {
      const Ref = Gd.get(j);
      Ref.$JS.init(Y, Ref);
    }
    Y.hasRequire = (name) => {
      return REQ.find(x=> x == name);
    };
    Y.tr3(`[CORE]${Add} Complete initialization.`);
    Y.init = false;
    return Y;
  };
  let Call = 0;
  Y.start = (nm) => {
    return new Promise ( resolve => {
      if (! nm) Y.throw(ver, `Unknown label.`);
      if (++Call > 10000) Call = 1;
      const myName = `${nm} [UNIT:${Call}]`;
      Y.tr3(`[CORE] >> ${myName} - START !!`);
      return resolve( new UNIT (myName, Y, Gd, Super) );
    }).catch( e => { Y.throw(ver, e) } );
  };
  Y.onFake = () => {
    Y.tr3('[CORE] Y.onFake');
    for (let key of T.v(Gd.get('REQUIRES'))) {
      if (MAIN && MAIN.$name == key && Y[key].onFake) {
        Y[key].onFake();
      } else {
        const Ref = Gd.get(key);
        if (Ref.$JS.initFake) {
          Ref.$JS.initFake(Y, Ref);
        } else {
          Y.tr3(`[CORE] ${Ref.$name} is not make 'onFake'.`);
        }
      }
  } };
  const Unn = ['init', 'run', 'onFake'];
  Y.superKit = (name, x, P, Ref) => {
    Y.tr6('[CORE] Y.superKit', name);
    const X = Object.assign(x, Y);
    X.par = P;
    if (P && P.conf) {
      if (P.conf) X.conf = P.conf[name] || P.conf;
    }
    if (Ref) X.Ref = Ref;
    for (let k of Unn) { X[k] = false }
    return X;
  };
  Y.tr1(`[CORE] Loaded Config:`, Y.conf.ver);
};
function UNIT (myName, Y, Gd, Super) {
  const R = this;
  R.ver = `${myName} (${my})`;
  [R.un, R.root, R.conf] = [Y, R, Y.conf];
       R.tmp = { $START: true };
  R.finished = () => { return R.tmp.$START ? false: true };
      R.away = () => { return FINISH(x=> R.box.rollback()) };
    R.finish = () => { return FINISH(x=> R.box.commit()) };
  R.rollback = ROLLBACK;
   R.unitKit = UNITKIT;
  R.procCash = PROCCASH;
       R.see = SEE;
  for (let key of ['box', 'brain', 'web']) {
    const Ref = Gd.get(key);
    R[key] = new Ref.$JS.Unit (R, Ref);
  }
  R.box.begin();
  const SYSd = Gd.get('sysdata');
  R.sysDB = (keys) =>
      { return new SYSd.$JS.Unit (R, SYSd, keys) };
  for (let key of T.v(Gd.get('REQUIRES'))) {
    const Ref = Gd.get(key);
    R[key] = new Ref.$JS.Unit (R, Ref);
  }
  for (let F of T.v(Gd.get('START'))) { F(R) };
  //
  function UNITKIT (name, X, P, Ref) {
    Y.tr5('[UNIT] unitKit', name);
    Y.superKit(name, X, P, Ref);
    X.root = R;
    for (let method of
      ['away', 'rollback', 'finish', 'procCash', 'see'] )
      { X[method] = R[method] }
    return Super(X);
  }
  function PROCCASH () {
    return R.$pC || (R.$pC = new ProcCASH (R, Gd.get('CASH')));
  }
  async function SEE (fr) {
    if (! fr.match
       (/^\s*\%([a-zA-Z0-9_]+)\s*\:\s*(.+)/)) return fr;
    const [key, arg] = [RegExp.$1, RegExp.$2];
    Y.tr3(`[UNIT] see`, key, arg);
    let result;
    await R[key].see(arg).then(r=> result = r);
    return result || '... (N/A) ...';
  }
  function $changeFlag_ () { R.tmp = { $FINISH: true } }
  function ROLLBACK () {
    $changeFlag_();
    for (let F of T.v(Gd.get('ROLLBACK'))) { F(R) };
    R.box.rollback();
    R.box.disconnect();
    Y.tr3(`[UNIT] >> ${myName} - ROLLBACK !!`);
    return R;
  }
  async function FINISH (func) {
    if (R.tmp.$FINISH) {
      Y.tr3(`[UNIT:${R.ver}] FINISH !! Duplicate call !!`)
       .then(e=> Y.c(Y.TRACE(e, 4)));
      return false;
    }
    $changeFlag_();
    for (let F of T.v(Gd.get('FINISH'))) { F(R) };
    await func();
    Y.tr3(`[UNIT:${R.ver}] FINISH !!`);
    return R;
  }
}
function ProcCASH (R, Ref) {
  const C = this;
    C.get = PC_GET;
    C.has = PC_HAS;
    C.set = PC_SET;
    C.del = PC_DEL;
  C.clean = PC_CLEAN;
  function PC_GET (key) {
    return Ref[key] ? Ref[key].value: null;
  }
  function PC_HAS (key) {
    return Ref[key] ? true : false;
  }
  function PC_SET (key, value, ttl) {
    return (Ref[key] =
      { TTL: T.unix_add((30 || ttl), 'm'), value: value });
  }
  function PC_DEL (key) {
    return Ref[key] ? (delete Ref[key]): false;
  }
  async function PC_CLEAN () {
    const now = T.unix();
    for (let [key, v] of T.e(Ref))
        { if (v.TTL < now) delete Ref[key] }
    return true;
  }
}
function LaunchUtil (Y, argv) {
  const A = this,
    Utils = {},
    ARGV  = [];
  for (let v of argv) {
    if (/^\-C\=([^\s]+)/.exec(v)) { Config = RegExp.$1 }
    else { ARGV.push(v) }
  }
  A.get  = () => { return ARGV };
  A.join = () => { return ARGV.join(' ') };
}
function Logger (c) {
  return {
    level: () => { c('Tried to set the level.') },
    trace: c, debug: c, info: c, warn: c, error: c,	fatal: c
  };
}
function initDebugLv (Y) {
  const  Lv = Y.conf.debug_level;
  const Ass = Lv
    ? (i) => { return i <= Lv ? Y.tr: async () => {} }
    : (i) => { return async () => {} };
  [...Array(7)].map((_, i) => { ++i; Y[`tr${i}`] = Ass(i) });
  return Lv;
}
function Inspect (Y, o) {
  return Y.tool.inspect(o, {
        depth: 3,
       colors: true,
   showHidden: true,
    showProxy: true,
maxArayLength: 10,
  breakLength: 120,
  ...( Y.conf.inspect )
  });
}
const sen  = '-----------------------------------';
const sen2 = '===================================';
function Trace (Y) {
  return async (...args) => {
    const trace = new Error().stack;
    const stacks = trace.split(/\s+at\s+/);
    stacks[2].match(/([^\/]+)\:\d+\)?\s*$/);
    let pref = RegExp.$1;7
    let [op, err] = [[], []];
    for (let v of Object.values(args)) {
      if (typeof v == 'object') {
        try {
          let txt = Inspect(Y, v);
          txt.length <= 5 ? err.push(v): op.push(txt);
        } catch (e) {
          err.push(v);
        }
      } else {
        op.push(`"${v}"`);
      }
    }
    if (op.length > 2) {
      Y.c(`${pref}> ` + op.join(`\n${sen}\n`) + `\n${sen}` ); 
    } else {
      Y.c(`${pref}> ` + op.join(' , ') );
    }
    for (let v of Object.values(err)) { Y.c(v); Y.c(sen) }
    return stacks;
  };
}
function $TRACE_ (stack, n) {
  const stacks =
      T.isArray(stack) ? stack: stack.split(/\s+at\s+/);
  let point = stacks[0].match(/^Error\:?$/)
              ? '': `${stacks[0]}\n`;
  for (let v of stacks.splice(n, stacks.length)) {
    if (v) { v = v.trim();
      if (v.match(/\/(yko\/[^\)]+)\:\d+\)\s*$/i)) {
        point += '> ' + RegExp.$1 + '\n';
      } else if (v.match(/(y\-[^/\)]+)\:\d+\)\s*$/)) {
        point += '> ' + RegExp.$1 + '\n';
  } } }
  return point;
}
function Throw (Y) {
  return (...mor) => {
    const point = $TRACE_(new Error().stack, 2);
    let out = '';
    for (let v of mor) {
      if (typeof v === 'object') {
        const tmp = Y.tool.inspect(v);
        if (/^(.+\n[^\n]*Error\:[^\n]+\n\s+at\s+[^\n]+).+/s
        .exec(tmp)) {
          out += `\n${sen}\n${RegExp.$1}`;
        } else if (/^[^\n]+\n\s+at\s+[^\n]+/s.test(tmp)) {
          out += `\n${sen}\n` + $TRACE_(tmp, 1);
        } else { out += `\n${v}` }
      } else { out += `\n${sen}\n${v}` }
    }
    Y.tr(`throw:${out}\n${sen2}`);
    Y.tr(point || "'Stack Trace' is empty.");
    throw true;
  };
}
