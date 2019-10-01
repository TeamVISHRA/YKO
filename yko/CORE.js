//
// yko/CORE.js
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'CORE.js';
const ver = `yko/${my} v191001.01`;
//
const sen  = '-----------------------------------';
const sen2 = '==================================='; 
//
let clone = 0;
module.exports = function (ARGS) {
  if (! ARGS) ARGS = Object.create(null);
  this.ver = ver;
  const Y = this;
  Y.im    = require('../im/now.js');
  Y.conf  = require('../y-config.js');
  Y.exit  = process.exit;
const YY = Object.create(Y);
YY.test = 1;
console.log(YY);
  //
  if (Y.im.location == 'devel') {
    Y.debug = () => { return true };
    Y.c = console.log;
    Y.log = Logger(Y.c);
  } else {
    const config = Y.conf.log4js || {
      appenders: { debug: {
        type: 'file',
        filename: './log/YKO.log',
        pattern: 'YYYYMMDD'
      } },
      categories:
      { default: { appenders: ['debug'], level : 'all'} }
    };
    Y.debug = () => { return false };
    const log4js = require('log4js');
    log4js.configure(config);
    Y.log = log4js.getLogger('debug');
    Y.c = (s) => { Y.log.trace(s) };
  }
  Y.tr = async (...args) => {
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
    return { stacks: stacks };
  };
  const Level = Y.im.debug_level || 0;
  Y.tr('YKO - debug_level', Level);
  for (let i of [1,2,3,4,5,6,7]) {
    Y[`tr${i}`] = (Level != 0 && i <= Level) ? Y.tr : () => {};
  }
  const CORES = Object.create(null);
  if (! ARGS.sysdata) ARGS.sysdata = Y.conf.sysDATA.keys;
  for (let k of ['TOOL', 'SYSDATA', 'BRAIN']) {
    let key  = k.toLowerCase();
    CORES[key] = require(`./${k}.js`);
    Y[key] = new CORES[key] (Y, ARGS[key]);
  }
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
  Y.throw = (...mor) => {
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
    Y.tr(`throw:${out}${sen2}`);
    Y.tr(point || "'Stack Trace' is empty.");
    throw true;
  };
  Y.sysDATA = Y.sysdata;
  Y.anyDATA =
    (X, keys) => { return new CORES.sysdata[0](X, keys) };
  let WEB;
  Y.web = () => {
    if (WEB) return WEB;
    const JS = require('./WEB.js');
    return (WEB = new JS (Y, ARGS.web));
  };
  const ON = Object.create(null);
  Y.ON = () => { return ON };
  Y.on = (k, f) => { ON[k] = f };
  const RUNNERS = [];
  Y.runners = (f) => { RUNNERS.push(f) };
  Y.RUNNERS = () => { return RUNNERS };
  const REQUIRES = [];
  Y.requires = () => { return REQUIRES };
  Y.REQ1 = () => { return REQUIRES[0] };
  Y.REQ2 = () => { return REQUIRES[1] };
  Y.REQUIRES = (key) =>
  { return REQUIRES.find(i=> REQUIRES[i] == key) };
  const INITS = [];
  Y.inits = () => { return INITS };
  Y.init = (...setup) => {
    for (let name of setup) {
      let noInit;
      if (typeof name == 'string') {
        if (name.match(/([^\:\s]+)\s*\:\s*init/i)) {
          name = [RegExp.$1];
        } else {
          noInit = name = [name];
        }
      }
      let j = require('./' + name[0].trim() + '.js');
      let k = name[0].match(/^\s*y([^\s]+)/);
      Y[k[1]] = new j (Y);
      REQUIRES.push(k[1]);
      if (! noInit) INITS.unshift(Y[k[1]]);
    }
    for (let o of INITS) { o.init() }
    for (let k in CORES)
    { if (Y[k].init) CORES[k][1] = (o) => { o.init() } }
  };
  let ENGINE = () => { Y.tr('??? (?o?) hoe ...!?') };
  Y.engine = (f) => { ENGINE = f };
  Y.run = async (result) => {
		ENGINE();
		return result;
	};
	Y.preparFake = () => {
		for (let k of REQUIRES)
      { if (Y[k].preparFake) Y[k].preparFake() }
	}
  Y.switchConsole = () => { Y.c = console.log };
  //
  const FLOW = { START:[], ROLLBACK:[], FINISH:[] };
  Y.onStart    = (f) => { FLOW.START.push(f)    };
  Y.onRollback = (f) => { FLOW.ROLLBACK.push(f) };
  Y.onFinish   = (f) => { FLOW.FINISH.push(f)   };
  Y.start = (lb) => {
    if (++clone > 10000) clone = 0;
    return new Promise (resolve => {
      const X = Y.tool.clone(Y);
      X.ver = lb ? `Clone [${clone}:${lb}]`
                 : `Clone [${clone}]`;
      Y.tr3(`\n${sen2}\n>>> start ...(${X.ver})\n${sen}`);
      resolve( x_component(X, ARGS, FLOW) );
    });
  };
  Y.tr(ver, '>>> Ready .....');
};
function x_component (X, ARGS, FLOW) {
  X.tmp = { $START: 1 };
  const BOX = require('./BOX.js');
  X.box = new BOX (X, ARGS.box);
  X.rollback = () => {
    for (let F of FLOW.ROLLBACK) { F(X) };
    X.box.rollback();
    X.tmp = Object.create(null);
    if (! label) label = 'Unknown';
    X.tr3(`>>> rollback ...(${X.ver})\n${sen}`);
    return true;
  };
  X.finish = () => {
    if (! X.tmp.$START) {
      X.tr3('X.tmp', 'Nothing');
      X.tr3(`Warning: `
      + `finish didn't exec ...(${X.ver})\n${sen}`);
      return false;
    }
    for (let F of FLOW.FINISH) { F(X) };
    X.box.commit();
    X.tmp = Object.create(null);
    X.tr3(`>>> finish ...(${X.ver})\n${sen}`);
    return true;
  };
  for (let F of FLOW.START) { F(X, args) };
  return X;
}
function Logger (c) {
  return {
    level: () => { c('Tried to set the level.') },
    trace: c, debug: c, info: c, warn: c, error: c,	fatal: c
  };
}
