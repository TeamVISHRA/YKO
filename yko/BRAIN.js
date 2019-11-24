'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'BRAIN.js';
const ver = `yko/${my} v191025`;
//
module.exports.init = function (Y, Ref) {
  init(Y, Ref, Y.tool);
}
module.exports.Unit = function (R, Ref) {
  const S = R.unitKit('brain', this, R, Ref);
  S.ver = ver;
  build_component(S);
}
function init (Y, Ref, T) {
  const PREFIX = Ref.prefix = Y.conf.brain.cmd_prefix;
  //
  const yName1 = '(?:[YyＹｙ]|[ワわ][イい])',
        yName2 = '(?:[KkＫｋ][OoＯｏ]|[コこ子])',
        yName3 = '(?:[Bbぼボ][Ooっッ][Ttとト])?',
      cmdStyle = '[A-Za-z0-9]+';
  //
  const yclReg = new RegExp(`^\\s*(${cmdStyle})\\s*(.*)$`),
       callReg = new RegExp(`^${yName1}${yName2}${yName3}\\s*(.*)$`),
        cmdReg = new RegExp(`^\\s*${PREFIX}(${cmdStyle})\\s*(.*)$`),
        wokReg = new RegExp(`^\\s*[お起]き[ろて]`);
  let As;
  if (As = Y.rack.get('ON').brain_command_alias) {
    for (let v of T.v(As)) {
      if (! v[0] || ! v[1])
          Y.throw(`[BRAIN] Check 'on.brain_command_alias'`);
      v[0] = new RegExp(`^\\s*${v[0]}\\s*(.*)`);
    }
    Ref.ALIAS = (str) => {
      for (let v of T.v(As))
        { if (str.match(v[0])) return `${v[1]} ${RegExp.$1}` }
      return str;
    };
  } else {
    Y.tr3('[BRAIN] on.command_alias', 'empty');
    Ref.ALIAS = (str) => { return str };
  }
  Ref.SLEEP  = Object.create(null);
  Ref.Reg = {
        myNames: [yName1, yName2, yName3],
        command: cmdStyle,
         callme: callReg,
  callmeCommand: yclReg,
    callCommand: cmdReg,
     callWakeup: wokReg
  };
  return Ref;
}
function build_component (S) {
  const T = S.tool,
      Ref = S.Ref;
 const SLEEP = T.clone(Ref.SLEEP);
    S.prefix = () => { return Ref.prefix };
     S.sleep = () => { return SLEEP };
  S.setSleep = setSleep;
   S.isSleep = isSleep;
S.cleanSleep = cleanSleep;
    S.isCall = isCall;
 S.txt2token = txt2token;
    S.mkTalk = mkTalk;
    S.buildK = buildK;
      S.talk = talk;
    S.wokeup = (check, bow) =>
        { return new WOKEUP (S, check, bow) };
  //
  function isSleep (k1, k2) {
    S.tr3('[BRAIN] isSleep');
    if (SLEEP[k1]) return true;
    if (SLEEP[`${k2}@${k1}`]) return true;
    if (SLEEP.__ALWAYS__) return true;
    return false;
  }
  function setSleep (k1, k2, a) {
    S.tr3('[BRAIN] setSleep');
    if (! k1) Y.throw(ver, "Unknown 'key 1'");
    if (a) {
      a = { check: () => {}, all: 0 };
    } else if (! a.check) {
      a.check = () => {};
    }
    let update;
    const Limit = T.unix_add((a.limit || (24* 60)), 'm');
    if (k2) {
      SLEEP[`${k2}@${k1}`] = Limit;
      update = true;
    }
    if (a.check(S, k1)) {
      S.tr3('[BRAIN] setSleep: &a.check()', 'Pass');
      SLEEP[k1] = Limit;
      if (a.all) SLEEP.__ALWAYS__ = Limit;
      update = true;
    }
    if (update) Ref.SLEEP = T.clone(SLEEP);
    return true;
  }
  async function cleanSleep () {
    S.tr3('[BRAIN] cleanSleep');
    let update;
    const Now = T.unix();
    for (let [k, v] of T.e(SLEEP)) {
      if (v < Now) {
        S.tr3('[BRAIN] cleanSleep: hit', k);
        delete SLEEP[k];
        update = true;
      }
    }
    if (update) Ref.SLEEP = T.clone(SLEEP);
    return true;
  }
  const Reg = Ref.Reg;
  function isCall (str, RES) {
    S.tr3('[BRAIN] isCall');
    S.isCall_result = T.c(null);
    let cmd, crum;
    str = T.canon(str);
    if (! str) return RES({ answer: '・・・' }); 
    if (/^[ワわ](?:[ッっ]*[はハ8８][ッっ]*)+$/.test(str))
        return RES({ answer: 'わは' });
    if (/^wa+ha+$/i.test(str))
        return RES({ answer: 'アロハぁ' });
    if (str.match(Reg.callme)) {
      if (str = RegExp.$1) {
        S.tr4('[BRAIN] isCall: YKO call', str);
        if ([,cmd,crum] =
              Ref.ALIAS(str).match(Reg.callmeCommand)) {
          S.tr4('[BRAIN] isCall: cmd call', str[1]);
          return RES({
            post: true,
             cmd: T.A2a(cmd),
            crum: (crum || ''),
            call: true
          });
        } else { return RES({ answer: 'もしかして呼んだ？' }) }
      } else { return RES({ answer: '何か御用？' }) }
    }
    if (str = str.match(Reg.callCommand)) {
      S.tr4('[BRAIN] isCall: command call', str[1]);
      return RES({
        post: true,
         cmd: T.A2a(str[1]),
        crum: (str[2] || '')
      });
    }
    return RES({ post: true });
  }
  function mkTalk () {
    return new (require('./lib/markingTalk.js')).Unit(S.root);
  }
  function talk (keys) {
    if (! Ref.Talk) Ref.Talk = require('./BRAIN/ybTalk.js');
    return Ref.Talk.build(S, keys);
  }
  function buildK () {
    return new Promise ( resolve => {
      if (Ref.ANALYS) return resolve(Ref.ANALYS);
      const Builder = T.kuromoji()
           .builder({ dicPath: S.conf.kuromojiDicPath });
      Builder.build((err, parse) => {
        if (err) S.throw(ver, err);
        return resolve(Ref.ANALYS = parse);
      });
    });
  }
  async function txt2token (txt) {
    let token; await S.buildK()
      .then( ps=> { token = ps.tokenize(txt) });
    return token;
  }
};
function WOKEUP (S, Check, Bow, RES) {
  const T = S.tool,
      Ref = S.Ref;
  S.tr3('[BRAIN] wokeup');
  const wokReg = Ref.Reg.callWakeup;
  const WO = this;
  if (! Check) S.throw
      (`[BRAIN] ${ver}`, 'Unknown function for checking.');
  if (! Bow) Bow = () => { return WO.greeting() };
  WO.Try = (k1, k2, str) => {
    S.tr3('[BRAIN] wokeup:Try');
    const SLEEP = T.clone(Ref.SLEEP);
    if (! k1) S.throw("[BRAIN] Unknown 'key 1'");
    if (! k2) S.throw("[BRAIN] Unknown 'key 2'");
    str = T.canonical(str);
    let debug = false;
    if (str.match(/^de?bu?g\s+(.+)/i)) {
      str = RegExp.$1;
      S.tr3('[BRAIN] wokeup:Try', 'is sleep (debug mode)');
      if (! S.debug()) return RES({ sleep: true });
    }
    if (str.match(yStyle1) && str.match(wokReg)) {
      S.tr4('[BRAIN] wokeup:Try', 'Trying');
      let wakeup;
      if (SLEEP[`${k2}@${k1}`]) {
        delete SLEEP[`${k2}@${k1}`];
        wakeup = true;
        S.tr4('[BRAIN] wokeup:Try - hit', `${k2}@${k1}`);
      }
      if (Check(WO, k1)) {
        S.tr4('[BRAIN] wokeup:Try &Check', 'Pass');
        delete SLEEP[k1];
        if (SLEEP.__ALWAYS__ && str.match(/al+\s*$/i)) {
          S.tr4('[BRAIN] wokeup:Try', 'Complete pleasure');
          delete SLEEP.__ALWAYS__;
        }
        wakeup = true;
      }
      if (wakeup) {
        S.tr3('[BRAIN] wokeup:Try', 'Awakened');
        Bow(WO);
        Ref.SLEEP = T.clone(SLEEP);
      } else {
        S.tr3('[BRAIN] wokeup:Try', 'Couldn\'t wake up');
      }
    } else {
      S.tr3('[BRAIN] wokeup:Try', 'Not trying to wake');
    }
    return RES({ sleep: true });
  };
  WO.greeting = () => {
    S.tr3('[BRAIN] wokeup:greeting');
    return 'おはよう。!!';
  };
}
