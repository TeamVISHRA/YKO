'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'BRAIN.js';
const ver = `yko/${my} v191013.01`;
//
module.exports.init = function (Y, Ref) {
  init(Y, Ref, Y.tool);
}
module.exports.Unit = function (R, Ref) {
  const S = R.unitKit('brain', this, 0, 0, Ref);
  S.ver = ver;
  build_component(S);
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
  let As;
  if (As = Y.rack.get('ON').brain_command_alias) {
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
function build_component (S) {
  const T = S.tool,
      Ref = S.Ref;
  S.prefix = () => { return Ref.prefix };
  S.talk = (keys) => {
    if (! Ref.Talk) Ref.Talk = require('./BRAIN/ybTalk.js');
    return Ref.Talk.build(S, keys);
  };
  const SLEEP = T.clone(Ref.SLEEP);
  S.sleep = () => { return SLEEP };
  S.setSleep = (k1, k2, a) => {
    S.tr1('setSleep');
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
      S.tr2('setSleep: &a.check()', 'Pass');
      SLEEP[k1] = Limit;
      if (a.all) SLEEP.__ALWAYS__ = Limit;
      update = true;
    }
    if (update) Ref.SLEEP = T.clone(SLEEP);
    return true;
  };
  S.isSleep = (k1, k2) => {
    S.tr1('isSleep');
    if (SLEEP[k1]) return true;
    if (SLEEP[`${k2}@${k1}`]) return true;
    if (SLEEP.__ALWAYS__) return true;
    return false;
  };
  S.cleanSleep = async () => {
    S.tr1('cleanSleep');
    let update;
    const Now = T.time_u();
    for (let [k, v] of T.e(SLEEP)) {
      if (v < Now) {
        S.tr2('cleanSleep: hit', k);
        delete SLEEP[k];
        update = true;
      }
    }
    if (update) Ref.SLEEP = T.clone(SLEEP);
    return true;
  };
  S.wokeup = (check, bow) => {
    return new WOKEUP (S, check, bow);
  };
  let ResultStock;
  S.result = (v) => {
    if (! v) return (ResultStock || { post: false });
    return (ResultStock = v);
  };
  const Reg = Ref.Reg;
  S.isCall = (str) => {
    S.tr1('isCall');
    S.isCall_result = T.c(null);
    let cmd, crum;
    str = T.canon(str);
    if (! str) return S.result({ answer: '・・・' }); 
    if (str.match(/^[ワわ](?:[ッっ]*[はハ8８][ッっ]*)+$/))
        return S.result({ answer: 'わは' });
    if (str.match(/^wa+ha+$/i))
        return S.result({ answer: 'アロハぁ' });
    if (str.match(Reg.callme)) {
      if (str = RegExp.$1) {
        S.tr2('isCall: YKO call', str);
        if ([,cmd,crum] =
              Ref.ALIAS(str).match(Reg.callmeCommand)) {
          S.tr2('isCall: cmd call', str[1]);
          return S.result({
            post: true,
             cmd: T.A2a(cmd),
            crum: (crum || ''),
            call: true
          });
        } else {
          return S.result({ answer: 'もしかして呼んだ？' });
        }
      } else {
        return S.result({ answer: '何か御用？' });
      }
    }
    if (str = str.match(Reg.callCommand)) {
      S.tr2('isCall: command call', str[1]);
      return S.result({
        post: true,
         cmd: T.A2a(str[1]),
        crum: (str[2] || '')
      });
    }
    return S.result({ post: true });
  };
  S.buildK = (str) => {
    if (Ref.ANALYS) return Ref.ANALYS;
    const Builder = T.kuromoji().builder
      ({ dicPath: '../node_modules/kuromoji/dict/' });
    Ref.ANALYS = new Promise ( resolve => {
      Builder.build((err, parse) => {
        if (err) S.throw(ver, err);
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
function WOKEUP (S, Check, Bow) {
  const T = S.tool,
      Ref = S.Ref;
  S.tr1('wokeup');
  const wokReg = Ref.Reg.callWakeup;
  const WO = this;
  if (! Check) S.throw(ver, 'Unknown function for checking.');
  if (! Bow) Bow = () => { return WO.greeting() };
  WO.Try = (k1, k2, str) => {
    S.tr1('wokeup:Try');
    const SLEEP = T.clone(Ref.SLEEP);
    if (! k1) S.throw(ver, "Unknown 'key 1'");
    if (! k2) S.throw(ver, "Unknown 'key 2'");
    str = T.canonical(str);
    let debug = false;
    if (str.match(/^de?bu?g\s+(.+)/i)) {
      str = RegExp.$1;
      S.tr1('wokeup:Try', 'is sleep (debug mode)');
      if (! S.debug()) return S.result({ sleep: true });
    }
    if (str.match(yStyle1) && str.match(wokReg)) {
      S.tr2('wokeup:Try', 'Trying');
      let wakeup;
      if (SLEEP[`${k2}@${k1}`]) {
        delete SLEEP[`${k2}@${k1}`];
        wakeup = true;
        S.tr2('wokeup:Try - hit', `${k2}@${k1}`);
      }
      if (Check(WO, k1)) {
        S.tr2('wokeup:Try &Check', 'Pass');
        delete SLEEP[k1];
        if (SLEEP.__ALWAYS__ && str.match(/al+\s*$/i)) {
          S.tr2('wokeup:Try', 'Complete pleasure');
          delete SLEEP.__ALWAYS__;
        }
        wakeup = true;
      }
      if (wakeup) {
        S.tr1('wokeup:Try', 'Awakened');
        Bow(WO);
        Ref.SLEEP = T.clone(SLEEP);
      } else {
        S.tr1('wokeup:Try', 'Couldn\'t wake up');
      }
    } else {
      S.tr1('wokeup:Try', 'Not trying to wake');
    }
    return S.result({ sleep: true });
  };
  WO.greeting = () => {
    S.tr1('wokeup:greeting');
    return 'おはよう。!!';
  };
}
