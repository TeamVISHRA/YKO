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
														else { op.push(txt) }
					} catch (e)            { err.push(v)  }
				}
			} else { op.push(`"${v}"`) }
		}
		Y.c(`${pref}> ` + op.join(op.length > 2
				? '\n------------------------------\n': ' , ') );
		for (let v of Object.values(err)) { Y.c(v) }
		return { stacks: stacks };
	};
	Y.tmp = {};
	const FLOW = { START:[], ROLLBACK:[], FINISH:[] };
	Y.start = (args) => {
		Y.tmp = { $START: 1 };
		Y.box.begin();
		for (let F of FLOW.START) { F(args) };
		return true;
	};
	Y.rollback = () => {
		for (let F of FLOW.ROLLBACK) { F() };
		Y.box.rollback();
		Y.tmp = {};
		return true;
	};
	Y.finish = () => {
		if (! Y.tmp.$START) {
			Y.tr2('Y.tmp', 'Nothing');
			return false;
		}
		for (let F of FLOW.FINISH) { F() };
		Y.box.commit();
		Y.tmp = {};
		return true;
	};
	let Level;
	if (Level = Y.im.debug_level) {
		Y.tr('YKO - debug_level', Level);
		let start    = Y.start;
		let rollback = Y.rollback;
    let finish   = Y.finish;
		Y.start = () => {
      Y.c('-----------------------------------');
      Y.tr(">>> start ...(Debug)");
      return start();
		};
		Y.rollback = () => {
      rollback();
      Y.tr(">>> rollback ...(Debug)");
      Y.c('-----------------------------------');
			return false;
		};
    Y.finish = () => {
			if (finish()) {
      	Y.tr(">>> finish ...(Debug)");
      	Y.c('-----------------------------------');
				return true;
			} else {
      	Y.tr("Warning: finish didn't exec ...(Debug)");
				return false;
			}
    };
		for (let i of [1,2,3,4,5,6,7]) {
			Y[`tr${i}`] = (i <= Level) ? Y.tr : () => {};
		}
	} else {
		for (let i of [1,2,3,4,5,6,7]) { Y[`tr${i}`] = () => {} }
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
			arg += s + Object.values(mor)
					.join('\n-----------------------------------\n');
		}
		Y.tr(`throw:\n${arg}\n===================================`);
		Y.tr(point || "'Stack Trace' is empty.");
//		Y.rollback();
		throw true;
	};
	Y.onStart    = (f) => { FLOW.START.push(f)    };
	Y.onRollback = (f) => { FLOW.ROLLBACK.push(f) };
	Y.onFinish   = (f) => { FLOW.FINISH.push(f)   };
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
	Y.init = (setup) => {
		for (let name of setup) {
			let noInit;
			if (typeof name == 'string') { noInit = name = [name] }
			let j = require('./' + name[0] + '.js');
			let k = name[0].match(/^y(.+)/);
			Y[k[1]] = new j (Y);
			REQUIRES.push(k[1]);
			if (! noInit) INITS.unshift(Y[k[1]]);
		}
		for (let o of INITS) { o.init() }
	};
	let ENGINE = () => { Y.c('??? (?o?) hoe ...!?') };
	Y.engine = (f) => {
  	Y.tr4('engine');
		ENGINE = f;
	};
	Y.run = () => {
  	Y.tr4('run');
		ENGINE();
	};
	Y.switchConsole = () => { Y.c = console.log };
	Y.tr(ver, '>>> Ready .....');
};
function Logger (c) {
	return {
		level: () => { c('Tried to set the level.') },
		trace: c, debug: c, info: c, warn: c, error: c,	fatal: c
	};
}
