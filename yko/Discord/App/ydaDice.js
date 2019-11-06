'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ydaDice.js';
const ver = `${my} v191028`;
//
const C = {
     default: 6,
         min: 2,
         max: 1000000,
     history: 5,
       color: 0xffaa6d,
  timeFormat: '/DD HH:mm:ss',
    cash_TTL: 60,  // minute.
  E: {
    num1: ':one: ',
    num2: ':two: ',
    num3: ':three: ',
    num4: ':four: ',
    num5: ':five: '
  }
};
let R, P, S, T;
module.exports.Unit = function (p) {
  R = p.root, P = p, T = p.tool;
  S = P.unitKit('dice', this, P);
  S.ver = ver;
  S.run = (crum) => {
    if (! P.isDM()) P.delete();
    let i = T.A2a(crum);
    if (i.match(/^\s*(\d+)/)) {
      exec_run(RegExp.$1);
    } else if (i.match(/^\s*history/)) {
      history_run();
    } else if (i.match(/^\s*reset/)) {
      reset_run();
    } else if (i.match(/^\s*help/)) {
      help_run();
    } else {
      exec_run(C.default);
    }
  };
}
function help_run () {
  S.parent.send({ embed: {
    title: 'サイコロ機能のヘルプ',
    color: 0x0083FC, fields: [
    { name: ';dice',
      value: '`・６面サイコロを振る。`' },
    { name: ';dice [数字]',
      value: '`・[数字]面サイコロを振る。`' },
    { name: ';dice history',
      value: '`・履歴の表示（最大' + C.history + '件）' },
    { name: ';dice reset',
      value: '`・履歴の初期化`' }
  ]	} }, 60);
  S.finish();
}
function exec_run (key, n) {
  _box_(BOX=> {
    BOX.TTL = C.cash_TTL;
    const rs = _dice_(BOX, n);
    let content = `.\n**【 ${rs.dice} 】**`;
    if (rs.args < 100) content += 'が出たよ';
    content += `\n　\`${rs.dice}  /${rs.args}\``;
    let embed = { embed: {
      author: { name: P.nickname(), icon_url: P.avatarURL()	},
 description: content,
   thumbnail: { url: P.avatarURL() },
       color: C.color,
      footer: { text:'履歴表示> ;dice history' }
    } };
    return P.send(embed, 15);
  });
}
function history_run (key) {
  _box_(BOX=> {
    if (BOX.hasNew() || BOX.get('history').length < 1)
          return P.reply(`サイコロの履歴がありません。`, 5);
    const hist = BOX.get('history');
    let [count, list]= [0, []];
    for (var v of hist) {
      let emoji = C.E['num' + ++count ] || '';
      list.push({
        name: (emoji + `..... **${v.dice}**`),
       value: T.unix_form(v.time),
      inline: true
      });
    }
    let guide = `※ ;dice reset で履歴を消去。`;
    let embed = { embed: {
      author: { name: P.nickname(), icon_url: P.avatarURL()	},
 description: '💠さいころ履歴',
       color: C.color,
      fields: list,
   timestamp: new Date(),
      footer: { text: guide }
    } };
    return P.send(embed, 30);
  });
}
function reset_run (key) {
  _box_(BOX => {
    if (BOX.hasNew() || BOX.get('history').length < 1)
      return P.reply(`履歴は既に無いみたいよ💢`, 5);
    BOX.set('history', []);
    BOX.prepar();
    return P.reply('さいころの履歴を消去したよ。', 10);
  });
}
function _dice_ (BOX, n) {
  if (! n) n = C.default;
  if (n < C.min) n = C.min;
  if (n > C.max) n = C.max;
  const Hty = BOX.get('history') || [];
  const Res = Math.floor(Math.random() * n) + 1;
  Hty.unshift({ time: T.unix(), dice: Res });
  const max = C.history;
  if (Hty.length > max) Hty.splice(max, Hty.length);
  BOX.set('history', Hty);
  BOX.prepar();
  return { args: n, dice: Res };
}
function _box_ (func) {
  const Key = `Discord:AppDice(${P.userID()})`;
  new Promise ( resolve => {
    return R.box.cash(Key).get()
        .then(db=> resolve(func(db)))
        .catch(e=> S.throw(e));
  }) .then(x=> R.finish() );
}
