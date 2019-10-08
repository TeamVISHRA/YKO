'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'BRAIN.js';
const ver = `yko/${my} v191008.01`;
//
module.exports.init = function (Y, Ref) {
  init(Y, Ref, Y.tool);
}
module.exports.Unit = function (Y, R, Ref) {
  const S = this;
    S.ver = ver;
   S.root = R;
  build_component(Y, S, Ref);
}
function init (Y, Ref, T) {
  const PREFIX = Ref.prefix = Y.im.command_prefix;
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
  let As; if (As = Y.rack.get('ON').brain_command_alias) {
    As = As();
    for (let v of T.v(As)) {
      if (! v[0] || ! v[1])
          Y.then(`Check 'on.brain_command_alias'`);
      v[0] = new RegExp(`^\\s*${v[0]}\\s*(.*)`);
    }
    Ref.ALIAS = (str) => {
      for (let v of T.v(As))
        { if (str.match(v[0])) return `${v[1]} ${RegExp.$1}` }
      return str;
    };
  } else {
    Y.tr3('on.command_alias', 'empty');
    Ref.ALIAS = { ALIAS: (str) => { return str } };
  }
  Ref.SLEEP  = Object.create(null);
  Ref.Reg = {
    myNames       : [yName1, yName2, yName3],
    command       : cmdStyle,
    callme        : callReg,
    callmeCommand : yclReg,
    callCommand   : cmdReg,
    callWakeup    : wokReg
  };
  return Ref;
}
function build_component (Y, S, Ref) {
  const T = Y.tool;
  S.prefix = () => { return Ref.prefix };
  S.talk = (keys) => {
    if (! Ref.Talk) Ref.Talk = require('./BRAIN/ybTalk.js');
    return Ref.Talk.build(X, Y, S, keys);
  };
  const SLEEP = T.clone(Ref.SLEEP);
  S.sleep = () => { return SLEEP };
  S.setSleep = (k1, k2, a) => {
    Y.tr1('setSleep');
    if (! k1) Y.throw(ver, "Unknown 'key 1'");
    if (a) {
      a = { check: () => {}, all: 0 };
    } else if (! a.check) {
      a.check = () => {};
    }
    let update;
    const Limit = T.time_u_add((a.limit || (24* 60)), 'm');
    if (k2) {
      SLEEP[`${k2}@${k1}`] = Limit;
      update = true;
    }
    if (a.check(S, k1)) {
      Y.tr2('setSleep: &a.check()', 'Pass');
      SLEEP[k1] = Limit;
      if (a.all) SLEEP.__ALWAYS__ = Limit;
      update = true;
    }
    if (update) Ref.SLEEP = T.clone(SLEEP);
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
    let update;
    const Now = T.time_u();
    for (let [k, v] of Y.tool.e(SLEEP)) {
      if (v < Now) {
        Y.tr2('cleanSleep: hit', k);
        delete SLEEP[k];
        update = true;
      }
    }
    if (update) Ref.SLEEP = T.clone(SLEEP);
    return true;
  };
  S.wokeup = (check, bow) => {
    return new WOKEUP (Y, S, Ref, check, bow, T);
  };
  const Reg = Ref.Reg;
	S.isCall = (str) => {
    Y.tr1('isCall');
    let cmd, crum;
		str = T.canon(str);
		if (str.match(/^[ワわ](?:[ッっ]*[はハ8８][ッっ]*)+$/))
        	return { answer: 'わは' };
		if (str.match(/^wa+ha+$/i))
        	return { answer: 'アロハぁ' };
    if (str.match(Reg.callme)) {
      if (str = RegExp.$1) {
        Y.tr2('isCall: YKO call', str);
        if ([,cmd,crum] =
              Ref.ALIAS(str).match(Reg.callmeCommand)) {
          Y.tr2('isCall: cmd call', str[1]);
          return {
             cmd : T.A2a(cmd),
            crum : (crum || ''),
            call : true
          };
        } else { return { answer: 'もしかして呼んだ？' } }
      } else { return { answer: '何か御用？' } }
    }
    if (str = str.match(Reg.callCommand)) {
      Y.tr2('isCall: command call', str[1]);
      return { cmd: T.A2a(str[1]), crum: (str[2] || '') };
    }
    return {};
	};
  S.buildK = (str) => {
    if (Ref.ANALYS) return Ref.ANALYS;
    const Builder = T.kuromoji().builder
      ({ dicPath: '../node_modules/kuromoji/dict/' });
    Ref.ANALYS = new Promise ( resolve => {
		  Builder.build((err, parse) => {
			  if (err) Y.throw(ver, err);
			  return resolve (parse);
		  });
	  });
    return Ref.ANALYS;
  };
  S.txt2token = async (txt) => {
    let token;
    await S.buildK()
        .then( ps => { token = ps.tokenize(txt) });
    return token;
  }
};
function WOKEUP (Y, S, Ref, Check, Bow, T) {
  Y.tr1('wokeup');
  const wokReg = Ref.Reg.callWakeup;
  const WO = this;
  if (! Check) Y.throw(ver, 'Unknown function for checking.');
  if (! Bow) Bow = () => { return WO.greeting() };
  WO.Try = (k1, k2, str) => {
    Y.tr1('wokeup:Try');
    const SLEEP = T.clone(Ref.SLEEP);
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
      let wakeup;
      if (SLEEP[`${k2}@${k1}`]) {
        delete SLEEP[`${k2}@${k1}`];
        wakeup = true;
        Y.tr2('wokeup:Try - hit', `${k2}@${k1}`);
      }
      if (Check(WO, k1)) {
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
        Ref.SLEEP = T.clone(SLEEP);
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
