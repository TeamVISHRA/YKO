'use strict'; 
//
// yko/CORE.js - Ver:5.001
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'CORE.js';
const ver = `yko/${my} v191014.01`;
//
module.exports = function (ARGS) {
	const Y = this;
  if (! ARGS) ARGS = Object.create(null);
	 Y.ver = ver;
    Y.un = Y;
    Y.im = require('../im/now.js');
  Y.conf = require('../y-config.js');
  Y.exit = process.exit;
  if (Y.im.location == 'devel') {
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
  const Lv = Y.im.debug_level || 0;
  for (let i of [1,2,3,4,5,6,7]) {
    Y[`tr${i}`] = (Lv != 0 && i <= Lv) ? Y.tr : () => {};
  }
  Y.tr1('[CORE] debug_level', Lv);
  const Tool = require('./TOOL.js');
  const T = Y.tool = new Tool (Y);
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
  Gd.get('sysdata').CASH = Y.tool.c(null);
  //
  Y.on = (key, func) => {
    if ( key.match(/^start$/i)
      || key.match(/^rollback$/i)
      || key.match(/^finish$/i)) {
      Gd.get(key.toUpperCase()).push(func);
    } else {
      Gd.get('ON')[key.toLowerCase()] = func;
    }
  };
  let ENGINE = () => { Y.tr('??? (?o?) hoe ...!?') };
   Y.runners = (key, func) => { Gd.get('RUNNERS')[key] = func };
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
  Y.init = (...setup) => {
    const REQ = Gd.get('REQUIRES');
    const Regist = (name) => {
      let result = Y.baseRD(name);
      result.$args = ARGS[result.$low];
      Gd.set(result.$name, result);
      REQ.push(result.$name);
      return result;
    };
    MAIN = Regist(setup.shift());
    Y[MAIN.$name] = new MAIN.$JS.Super (Y, MAIN);
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
    Y.tr3(`[CORE] ${MAIN.$name} - Complete initialization.`);
    Y.init = false;
  };
  let Call = 0;
  const Super = MAIN
      ? (X) => { X.super = Y[MAIN.$name]; return X }
      : (X) => { return X };
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
      if (Y[key] && Y[key].onFake) {
        Y[key].onFake();
      } else {
        const Ref = Gd.get(key);
        if (Ref.$JS.onFake) Ref.$JS.onFake(Y, Ref);
      }
  } };
  Y.superKit = (name, x, P, Ref) => {
    Y.tr6('[CORE] Y.superKit', name);
    const X = Object.assign(x, Y);
    X.par = P;
    if (P) {
      if (P.im && P.im[name]) X.im = P.im[name];
      if (P.conf && P.conf[name]) X.conf = P.conf[name];
    }
    if (Ref) X.Ref = Ref;
    for (let k of [MAIN.$name, 'run', 'init', 'onFake'])
    { delete X[k] }
    return X;
  };
  Y.tr1(`[CORE] ${ver}`, '>>> Radey ...');
};
function UNIT (myName, Y, Gd, Super) {
  const R = this, T = Y.tool;
  R.ver = `${myName} (${my})`;
  [R.un, R.conf, R.im] = [Y, Y.conf, Y.im];
  R.unitKit = (name, X, P, Ref) => {
    Y.tr5('[UNIT] unitKit', name);
    Y.superKit(name, X, P, Ref);
        X.root = R;
    X.rollback = R.rollback;
      X.finish = R.finish;
    if (P.super) X.super;
    return Super(X);
  };
  R.tmp = { $START: 1 };
  for (let key of ['box', 'brain', 'web']) {
    const Ref = Gd.get(key);
    R[key] = new Ref.$JS.Unit (R, Ref);
  }
  const SYSd = Gd.get('sysdata');
  R.sysDB = (keys) =>
      { return new SYSd.$JS.Unit (R, SYSd, keys) };
  for (let key of T.v(Gd.get('REQUIRES'))) {
    const Ref = Gd.get(key);
    R[key] = new Ref.$JS.Unit (R, Ref);
  }
  R.rollback = () => {
    for (let F of T.v(Gd.get('ROLLBACK'))) { F(R) };
    R.box.rollback();
    R.tmp = T.c(null);
    Y.tr3(`[UNIT] >> ${myName} - ROLLBACK !!`);
  };
  R.finish = () => {
    if (! R.tmp.$START) {
      Y.tr3(`[UNIT] Warning: `
      + `FINISH didn't exec ...(${R.ver})\n${sen}`);
      return false;
    }
    for (let F of T.v(Gd.get('FINISH'))) { F(R) };
    R.box.commit();
    R.tmp = T.c(null);
    Y.tr3(`[UNIT] >> ${myName} - FINISH !!`);
  };
  for (let F of T.v(Gd.get('START'))) { F(R) };
}
function Logger (c) {
  return {
    level: () => { c('Tried to set the level.') },
    trace: c, debug: c, info: c, warn: c, error: c,	fatal: c
  };
}
const sen  = '-----------------------------------';
const sen2 = '==================================='; 
function Trace (Y) {
  return async (...args) => {
    const trace = new Error().stack;
    const stacks = trace.split(/\s+at\s+/);
    stacks[2].match(/([^\/]+)\:\d+\)?\s*$/);
    let pref = RegExp.$1;
    let [op, err] = [[], []];
    for (let v of Object.values(args)) {
      if (typeof v == 'object') {
        if (v instanceof Array) {
          op.push('[' + v.map(x=> `"${x}"`).join(',') + ']');
        } else {
          try {
            let txt = Y.tool.json2txt(v);
            if (txt.length <= 5) { err.push(v)  }
            else                 { op.push(txt) }
          } catch (e)            { err.push(v)  }
        }
      } else { op.push(`"${v}"`) }
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
function Throw (Y) {
  const TRACE = (stack, n) => {
    const stacks = stack.split(/\s+at\s+/);
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
  };
  return (...mor) => {
    const point = TRACE(new Error().stack, 2);
    let out = '';
    for (let v of mor) {
      if (typeof v === 'object') {
        const tmp = Y.tool.inspect(v);
        if (tmp.match(/^[^\:]*Error[^\:]*\:.+\s+at\s+/g)) {
          out += `\n${sen}\n` + TRACE(tmp, 1);
        } else { out += `\n${sen}\n${v}` }
      } else   { out += `\n${sen}\n${v}` }
    }
    Y.tr(`throw:${out}\n${sen2}`);
    Y.tr(point || "'Stack Trace' is empty.");
    throw true;
  };
}
