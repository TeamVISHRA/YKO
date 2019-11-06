'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ydaSplittime.js';
const ver = `${my} v191028`;
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
let R, P, S, T;
module.exports.Unit = function (p) {
  R = p.root, P = p, T = p.tool;
  S = P.unitKit('app:splittime', this, P);
  S.run = (crum) => {
  if (! P.isDM()) P.delete();
  const i = crum || '';
  if (i.match(/^\s*start\s*(.*)/i)) {
    run_start(RegExp.$1);
  } else if (i.match(/^\s*lap/i)) {
    run_lap();
  } else if (i.match(/^\s*history/i)) {
    run_history();
  } else if (i.match(/^\s*reset\s+start\s*(.*)/i)) {
    run_resetStart();
  } else if (i.match(/^\s*end/i)) {
    run_end();
  } else {
    run_help();
  } };
}
function PF () { return S.root.brain.prefix() }
function res () {
  return {
    already: `既に計測中どす。\n\`終了： ${PF()}sp end\``,
    nostart: `まだ開始してないよ。\n\`開始： ${PF()}sp start\``,
     nodata: `データが無いです・・・\n\`計測： ${PF()}sp start\``
  }
}
function run_help () {
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
  } }, 60);
  R.finish();
}
function run_start (str, next) {
  box(next, BOX => {
    let Title;
    if (next) {
      Title = 'データ初期化（計測を継続）';
    } else {
      if (! BOX.hasNew()) return P.reply(res().already, 5);
      Title = '時間の計測を開始';
    }
    const START = BOX.set('startTime', T.unix());
    BOX.TTL = checkTTL(str);
    BOX.set('laps', []);
    BOX.prepar();
    const embed = baseEmbed({ title: Title });
    embed.description = `
-----------------------------------
開始時刻：　${T.unix_form(START)}
-----------------------------------
有効時間：　${T.min2form(BOX.TTL)}

\`${PF()}sp lap で経過時間を記録します。\`
`;
    P.send({ embed: embed }, 60);
    return true;
  });
}
function run_resetStart (str) {
  box(0, BOX => {
    BOX.hasNew() ? P.reply(res().nostart, 5)
                 : run_start(str, BOX);
    return false;
  });
}
function run_lap () {
  box(0, BOX => {
    if (BOX.hasNew()) return P.reply(res().nostart, 5);
      const Now = T.unix(),
           Laps = BOX.get('laps'),
          Stime = BOX.get('startTime');
     const Diff = Now - Number(Stime);
     const Humn = T.sec2form(Diff);
    BOX.set('laps', T.push2cut(Laps,
    { time: Now, diff: Diff, humn: Humn }, C.history.limit));
    BOX.prepar();
    const embed = baseEmbed({ title: '経過時間を記録' });
    embed.description = `
${T.unix_form(Stime)} ～ ${T.unix_form(Now)}
-----------------------------------
経過：　**${Humn}**

\`※履歴の確認\`　 ${PF()}sp history
`;
    P.send({ embed: embed }, 15);
    return true;
  });
}
function run_history () {
  box(0, BOX => {
    if (BOX.hasNew()) return P.reply(res().nostart, 5);
    const Laps = BOX.get('laps'),
         Stime = BOX.get('startTime');
    if (Laps.length < 1) return P.reply(res().nodata, 5);
    const embed = baseEmbed
          ({ title: '経過時間の計測履歴', fields: [] });
    embed.description = `
\`開始時間： ${T.unix_form(Stime)}\`
------------------------------`;
    let count = 0;
    for (let v of Laps) {
      embed.fields.push({
        name: `[ ${++count} ]　**${v.humn} 経過**`,
       value: `\`${T.unix_form(v.time)}\``
      });
    }
    embed.footer = `※計測リセット　${PF()}sp reset-start`;
    P.send({ embed: embed }, 90);
    return true;
  });
}
function run_end () {
  box(0, BOX => {
    if (BOX.hasNew()) return P.reply(res().nostart, 5);
    BOX.remove();
    P.reply('計測を終了（データ消去済）', 10);
    return true;
  });
}
function checkTTL (n) {
  if (n = Number(n)) {
    if (n < C.cash.TTLmin) n = C.cash.TTLmin;
    if (n > C.cash.TTLmax) n = C.cash.TTLmax;
    return n;
  } else {
    return C.cash.TTL;
  }
}
function baseEmbed (a) {
  const embed = {
   color: C.barColor,
  author: {
       name: P.nickname(),
   icon_url: P.avatarURL()
    }
  };
  if (a) { for (let [k, v] of T.e(a)) { embed[k] = v } }
  return embed;
}
function box (box, func) {
  const Key = `Discord:AppSpTime(${P.userID()})`;
  new Promise ( resolve => {
    if (box) {
      return resolve(func(box));
    } else {
      return R.box.cash(Key).get()
          .then(db=> resolve(func(db)))
          .catch(e=> S.throw(e));
    }
  }) .then(x=> { if (x) R.finish() });
}
