'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ydaSplittime.js';
const ver = `${my} v191130`;
//
const C = {
  barColor: 0xb1eb34,
   history: { limit: 20 },
  cash: {
       TTL: (10* 60),
    TTLmin: 10,
    TTLmax: (3* (24* 60))
  }
};
module.exports.Unit = function (P) {
  const R = P.root,
        T = P.tool,
        S = P.unitKit('app:splittime', this, P);
  S.run = RUN;
  //
  function RUN (crum) {
    if (! P.isDM()) P.delete();
    const i = T.A2a(crum);
    if (/^\s*start\s*(.*)/.exec(i)) {
      START(RegExp.$1);
    } else if (i.match(/^\s*reset\s+start\s*(.*)/i)) {
      RESET_START(RegExp.$1);
    } else if (i.match(/^\s*lap/i)) {
      LAP();
    } else if (i.match(/^\s*history/i)) {
      HISTORY();
    } else if (i.match(/^\s*end/i)) {
      END();
    } else {
      HELP();
    }
  }
  function HELP () {
    P.send({ embed: {
      title: '時間計測機能のヘルプ',
      color: 0x0083FC, fields: [
        { name: `${PF()}sp start`,
        value: '`・計測の開始`' },
        { name: `${PF()}sp lap`,
        value: '`・開始からの経過時間を記録\n　※最大記録件数： 20`' },
        { name: `${PF()}sp history`,
        value: '`・記録の履歴表示`' },
        { name: `${PF()}sp reset-start`,
        value: '`・履歴を初期化して再計測`' },
        { name: `${PF()}sp end`,
        value: '`・計測終了（データ消去）`' }
      ],
      footer: ver
    } }, 60).then(x=> R.away());
  }
  function START (str, next) {
    box(next, BOX => {
      let Title;
      if (next) {
        Title = 'データ初期化（計測を継続）';
      } else {
        if (! BOX.hasNew()) return RESULT('already');
        Title = '時間の計測を開始';
      }
      const START = T.unix();
      BOX.set('startTime', START).set('laps', []).prepar();
      BOX.TTL = checkTTL(str);
      return P.send({ embed: baseEmbed({
        title: Title,
  description: messages('start', {
      start: T.unix_form(START),
     active: T.min2form(BOX.TTL)
        })
      }) }, 60);
    }).then(x=> R.finish());
  }
  function RESET_START (str) {
    box(false, BOX => {
      BOX.hasNew() ? RESULT('nostart'): START(str, BOX);
      return false;
    });
  }
  function LAP () {
    box(false, BOX => {
      if (BOX.hasNew()) return RESULT('nostart');
       const Now = T.unix(),
            Laps = BOX.get('laps'),
           Stime = BOX.get('startTime');
      const Diff = Now - Number(Stime);
      const Humn = T.sec2form(Diff);
      const   IS = { time: Now, diff: Diff, humn: Humn };
      BOX.set('laps',
          T.push2cut(Laps, IS, C.history.limit)).prepar();
      return P.send({ embed: baseEmbed({
        title: '経過時間を記録',
  description: messages('lap', {
      start: T.unix_form(Stime),
        now: T.unix_form(Now),
       humn: Humn
        })
      }) }, 15);
    }).then(x=> R.finish());
  }
  function HISTORY () {
    box(false, BOX => {
      if (BOX.hasNew()) return RESULT('nostart');
      const Laps = BOX.get('laps'),
           Stime = BOX.get('startTime');
      if (Laps.length < 1) return RESULT('nodata');
      return P.send({ embed: baseEmbed({
        title: '経過時間の計測履歴',
       fields: createFields(Laps),
  description: `
  \`開始時間： ${T.unix_form(Stime)}\`
  ------------------------------`,
       footer: { text: `※計測リセット　${PF()}sp reset-start` }
      }) }, 90);
    }).then(x=> R.finish());
    function createFields (Laps) {
      let count = 0;
      const Fields = [];
      for (let v of Laps) {
        Fields.push({
          name: `[ ${++count} ]　**${v.humn} 経過**`,
         value: `\`${T.unix_form(v.time)}\``
        });
      }
      return Fields;
    }
  }
  function END () {
    box(false, BOX => {
      if (BOX.hasNew()) return RESULT('nostart');
      BOX.DataRemove();
      return P.reply('計測を終了（データ消去済）', 10);
    }).then(x=> R.finish());
  }
  function box (box, func) {
    const Key = `Discord:AppSpTime(${P.userID()})`;
    return new Promise ( resolve => {
      if (box) {
        return resolve(func(box));
      } else {
        return R.box.cash(Key).get()
            .then(db=> { return resolve(func(db)) })
            .catch(e=> S.throw(e));
      }
    });
  }
  function PF () { return R.brain.prefix() }
  function baseEmbed (a) {
    return {
     color: C.barColor,
    author: {
         name: P.nickname(),
     icon_url: P.avatarURL()
      }, ...a
    };
  }
  function checkTTL (n) {
    if (n = Number(n || 0)) {
      if (n < C.cash.TTLmin) n = C.cash.TTLmin;
      if (n > C.cash.TTLmax) n = C.cash.TTLmax;
      return n;
    } else {
      return C.cash.TTL;
    }
  }
  function RESULT (key) {
    return P.reply(messages(key), 10).then(x=> R.away());
  }
  function messages (key, arg) {
    const Messages = {
already:
`既に計測中どす。\n\`終了： ${PF()}sp end\``,
nostart:
`まだ開始してないよ。\n\`開始： ${PF()}sp start\``,
nodata:
`データが無いです・・・\n\`計測： ${PF()}sp start\``
    };
    Messages.start = () => {
      return `
-----------------------------------
開始時刻：　${arg.start}
-----------------------------------
有効時間：　${arg.active}

\`${PF()}sp lap で経過時間を記録します。\``;
    };
    Messages.lap = () => {
      return `
${arg.start} ～ ${arg.now}
-----------------------------------
経過：　**${arg.humn}**

\`※履歴の確認\`　 ${PF()}sp history`;
    };
    return T.isFunction
      (Messages[key]) ? Messages[key](): Messages[key];
  }
}
