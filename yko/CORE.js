//
// yko/CORE.js
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'CORE.js';
const ver = `yko/${my} v190928.01`;
//
module.exports = function (ARGS) {
  this.ver = ver;
  const Y = this;
  Y.im = require('../im/now.js');
  Y.conf = require('../y-config.js');
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
  const sen  = '-----------------------------------';
	const sen2 = '==================================='; 
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
  Y.throw = (arg, ...mor) => {
    const err = new Error().stack;
    const stacks = err.split(/\s+at\s+/);
    let point = '';
    for (let v of stacks.splice(2, stacks.length)) {
      if (v) { v = v.trim();
        if (v.match(/\/(yko\/[^\)]+)\:\d+\)\s*$/)) {
          point += '> ' + RegExp.$1 + '\n';
        } else if (v.match(/(y\-[^/\)]+)\:\d+\)\s*$/)) {
          point += '> ' + RegExp.$1 + '\n';
          //					break;
        }
      }
    }
    if (mor) {
      arg += s + Object.values(mor).join(`\n${sen}\n`);
    }
    Y.tr(`throw:\n${arg}\n${sen2}`);
    Y.tr(point || "'Stack Trace' is empty.");
    //		Y.rollback();
    throw true;
  };
  Y.tmp = {};
  const FLOW = { START:[], ROLLBACK:[], FINISH:[] };
  Y.onStart    = (f) => { FLOW.START.push(f)    };
  Y.onRollback = (f) => { FLOW.ROLLBACK.push(f) };
  Y.onFinish   = (f) => { FLOW.FINISH.push(f)   };
  Y.start = (args) => {
    Y.tr3(`\n${sen2}\n>>> start ...(Debug)\n${sen}`);
    Y.tmp = { $START: 1 };
    Y.box.begin();
    for (let F of FLOW.START) { F(args) };
    return true;
  };
  Y.rollback = () => {
    for (let F of FLOW.ROLLBACK) { F() };
    Y.box.rollback();
    Y.tmp = {};
    Y.tr3(`>>> rollback ...(Debug)\n${sen}`);
    return true;
  };
  Y.finish = () => {
    if (! Y.tmp.$START) {
      Y.tr3('Y.tmp', 'Nothing');
      Y.tr3(`Warning: finish didn't exec ...(Debug)\n${sen}`);
      return false;
    }
    for (let F of FLOW.FINISH) { F() };
    Y.box.commit();
    Y.tmp = {};
    Y.tr3(`>>> finish ...(Debug)\n${sen}`);
    return true;
  };
  Y.exit = (cd) => {
    Y.rollback();
    process.exit( cd != null ? cd : 0 );
  };
  if (! ARGS) ARGS = {};
  if (! ARGS.sysdata) ARGS.sysdata = Y.conf.sysDATA.keys;
  const JS = {};
  for (let k of ['BOX', 'TOOL', 'BRAIN', 'SYSDATA', 'WEB']) {
    let key = k.toLowerCase();
    JS[key] = require(`./${k}.js`);
    Y[key] = new JS[key] (Y, ARGS[key]);
  }
  Y.sysDATA = Y.sysdata;
  Y.anyDATA = (keys) => { return new JS.sysdata (Y, keys) };
  //
  const ON = {};
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
  //
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
  };
  let ENGINE = () => { Y.tr('??? (?o?) hoe ...!?') };
  Y.engine = (f) => { ENGINE = f };
  Y.run = async (result) => {
		ENGINE();
		return result;
	};
  Y.switchConsole = () => { Y.c = console.log };
  Y.tr(ver, '>>> Ready .....');
	Y.preparFake = () => {
		for (let o of INITS)
		{ if (o.preparFake) o.preparFake() }
	}
};
function Logger (c) {
  return {
    level: () => { c('Tried to set the level.') },
    trace: c, debug: c, info: c, warn: c, error: c,	fatal: c
  };
}
