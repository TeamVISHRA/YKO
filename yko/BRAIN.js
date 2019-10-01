//
// Ｓ：yko-person.js
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'BRAIN.js';
const ver = `yko/${my} v190930.01`;
//
let Y, S, T;
module.exports = function (y) {
  this.ver = ver;
  [S, Y] = [this, y];
  T = Y.tool;
  const PREFIX = Y.im.prefix;
  //
  const yName1 = '(?:[YyＹｙ]|[ワわ][イい])';
  const yName2 = '(?:[KkＫｋ][OoＯｏ]|[コこ子])';
  const yName3 = '(?:[Bbぼボ][Ooっッ][Ttとト])?';
  const cmdStyle = '[A-Za-z0-9]+';
  //
  const callReg = new RegExp(`^${yName1}${yName2}${yName3}\\s*(.*)$`);
  const yclReg  = new RegExp(`^\\s*(${cmdStyle})\\s*(.*)$`);
  const cmdReg  = new RegExp(`^\\s*${PREFIX}(${cmdStyle})\\s*(.*)$`);
  const wokReg  = new RegExp(`^\\s*[お起]き[ろて]`);
  //
  S.prefix = () => { return PREFIX };
  //
  S.parts = {
    prefix: PREFIX,
    myNames: [yName1, yName2, yName3],
    command: cmdStyle,
    regexp: {
      callme: callReg,
      callmeCommand: yclReg,
      callCommand: cmdReg,
      callWakeup: wokReg
    }
  };
  const ON = {};
  S.on = (key, f) => { ON[key] = f };
  let ALIAS;
  S.init = () => {
    if (! ON.command_alias) {
      Y.tr3('on.command_alias', 'empty');
      ALIAS = (str) => { return str };
      return;
    }
    const Alias = ON.command_alias();
    for (let v of Alias) {
      if (! v[0] || ! v[1]) Y.then(`Check 'on.command_alias'`);
      v[0] = new RegExp('^\s*' + v[0] + '\s*(.*)');
    }
    ALIAS = (str) => {
      for (let v of Alias)
      { if (str.match(v[0])) return `${v[1]} ${RegExp.$1}` }
      return str;
    };
  };
  let Talk;
  S.talk = (keys) => {
    if (! Talk) Talk = require('./BRAIN/ybTalk.js');
    return Talk.build(Y, S, keys);
  };
  const SLEEP = {};
  S.sleep = () => { return SLEEP };
  S.setSleep = (k1, k2, a) => {
    Y.tr1('setSleep');
    if (! k1) Y.throw(ver, "Unknown 'key 1'");
    if (a) {
      a = { check: () => {}, all: 0 };
    } else if (! a.check) {
      a.check = () => {};
    }
    const Limit = T.time_u_add((a.limit || (24* 60)), 'm');
    if (k2) SLEEP[`${k2}@${k1}`] = Limit;
    if (a.check(S, k1)) {
      Y.tr2('setSleep: &a.check()', 'Pass');
      SLEEP[k1] = Limit;
      if (a.all) SLEEP.__ALWAYS__ = Limit;
    }
    return true;
  };
  S.isSleep = (k1, k2) => {
    Y.tr1('isSleep');
    if (SLEEP[k1]) return true;
    if (SLEEP[`${k2}@${k1}`]) return true;
    if (SLEEP.__ALWAYS__) return true;
    return false;
  };
  S.cleanSleep = async () => {
    Y.tr1('cleanSleep');
    const Now = T.time_u();
    for (let [k, v] of Object.entries(SLEEP)) {
      if (v < Now) {
        Y.tr2('cleanSleep: hit', k);
        delete SLEEP[k];
      }
    }
    return true;
  };
  S.wokeup = (c, b) => {
    return new _WOKEUP_(SLEEP, c, b);
  };
	S.isCall = (str) => {
    Y.tr1('isCall');
		str = T.canonical(str);
		if (str.match(/^[ワわ](?:[ッっ]*[はハ8８][ッっ]*)+$/))
        	return { answer: 'わは' };
		if (str.match(/^wa+ha+$/i))
        	return { answer: 'アロハぁ' };
    if (str.match(callReg)) {
      if (str = RegExp.$1) {
        Y.tr2('isCall: YKO call', str);
        if (str = ALIAS(str).match(yclReg)) {
          Y.tr2('isCall: cmd call', str[1]);
          return {
            cmd: T.A2a(str[1]),
            crum: (str[2] || ''),
            call: true
          };
        } else { return { answer: 'もしかして呼んだ？' } }
      } else { return { answer: '何か御用？' } }
    }
    if (str = str.match(cmdReg)) {
      Y.tr2('isCall: command call', str[1]);
      return {
        cmd: T.A2a(str[1]),
        crum: (str[2] || '')
      };
    }
    return {};
	};
  let ANALYS;
  S.buildK = (str) => {
    if (ANALYS) return ANALYS;
    const Builder = T.kuromoji().builder
      ({ dicPath: '../node_modules/kuromoji/dict/' });
    ANALYS = new Promise ( rev => {
		  Builder.build((err, parse) => {
			  if (err) Y.throw(err);
			  return rev (parse);
		  });
	  });
    return ANALYS;
  };
  S.txt2token = async (txt) => {
    let token;
    await S.buildK()
           .then( ps => { token = ps.tokenize(txt) });
    return token;
  }
};
function _WOKEUP_ (SLEEP, Check, Bow) {
  Y.tr1('wokeup:_WOKEUP_');
  const WO = this;
  if (! H) Y.throw(ver, 'Unknown message handler.');
  if (! Bow) Bow = (wo) => { return wo.greeting() };
  if (! Check) Y.throw(ver, 'Unknown function for checking.');
  WO.Try = (k1, k2, str) => {
    Y.tr1('wokeup:Try');
    if (! k1) Y.throw(ver, "Unknown 'key 1'");
    if (! k2) Y.throw(ver, "Unknown 'key 2'");
		str = T.canonical(str);
    let debug = false;
    if (str.match(/^de?bu?g\s+(.+)/i)) {
      str = RegExp.$1;
      Y.tr1('wokeup:Try', 'is sleep (debug mode)');
      if (! Y.debug()) return { sleep: true };
    }
    if (str.match(yStyle1) && str.match(wokReg)) {
      Y.tr2('wokeup:Try', 'Trying');
      let wakeup = false;
      if (SLEEP[`${k2}@${k1}`]) {
        delete SLEEP[`${k2}@${k1}`];
        wakeup = true;
        Y.tr2('wokeup:Try - hit', `${k2}@${k1}`);
      }
      if (Check(WO, H, k1)) {
        Y.tr2('wokeup:Try &Check', 'Pass');
        delete SLEEP[k1];
        if (SLEEP.__ALWAYS__ && str.match(/al+\s*$/i)) {
          Y.tr2('wokeup:Try', 'Complete pleasure');
          delete SLEEP.__ALWAYS__;
        }
        wakeup = true;
      }
      if (wakeup) {
        Y.tr1('wokeup:Try', 'Awakened');
        Bow(WO);
      } else {
        Y.tr1('wokeup:Try', 'Couldn\'t wake up');
      }
    } else {
      Y.tr1('wokeup:Try', 'Not trying to wake');
    }
    return { sleep: true };
  };
  WO.greeting = () => {
    Y.tr1('wokeup:greeting');
    return 'おはよう。!!';
  };
}
