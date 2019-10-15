'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ydaDice.js';
const ver = `${my} v191014.01`;
//
const C = {
     default: 6,
         min: 2,
         max: 1000000,
     history: 5,
       color: 0xffaa6d,
  timeFormat: '/DD HH:mm:ss',
   cash_life: (60* 60),  // 1時間
  E: {
    num1: ':one: ',
    num2: ':two: ',
    num3: ':three: ',
    num4: ':four: ',
    num5: ':five: '
  }
};
module.exports.Unit = function (P) {
  const S = P.unitKit('dice', this, P);
  S.ver = ver;
  S.run = (crum) => {
    const dataKey = {
      id: S.dir.buildDataID(P.guildID()),
      name: buildName(S)
    };
    if (! P.isDM()) P.delete();
    let i = S.tool.A2a(crum);
    if (i.match(/^\s*(\d+)/)) {
      exec_run(S, dataKey, RegExp.$1);
    } else if (i.match(/^\s*history/)) {
      history_run(S, dataKey);
    } else if (i.match(/^\s*reset/)) {
      reset_run(S, dataKey);
    } else if (i.match(/^\s*help/)) {
      help_run(S);
    } else {
      exec_run(S, dataKey, C.default);
    }
  };
}
function buildName (S) {
  const id = S.par.userID();
  const name = S.par.nickname();
  return `_APP_DISCE_${id}_${name}_`;
}
function help_run (S) {
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
function exec_run (S, key, n) {
  const R = S.root, P = S.par;
  new Promise ( async resolve => {
    let rs;
    await R.box.cash(key).then( BOX => {
      if (BOX.isNew()) BOX.set('history', []);
      BOX.life = C.cash_life;
      rs = dice(S, BOX, n);
    });
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
    resolve( P.send(embed, 15) );
  })
  .then(x=> { S.finish() });
}
function history_run (S, key) {
  const R = S.root, P = S.par, T = S.tool;
  new Promise ( async resolve => {
    let BOX;
    await R.box.cash(key).then( box => { BOX = box });
    if (BOX.isNew() || BOX.get('history').length < 1) {
    return resolve(P.reply
      (`サイコロの履歴がありません。\n\`${ver}\``, 5));
    }
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
    let guide = `※ ;dice reset で履歴を消去。\n\`${ver}\``;
    let embed = { embed: {
    author: { name: P.nickname(), icon_url: P.avatarURL()	},
    description: '💠さいころ履歴',
    color: C.color,
    fields: list,
    timestamp: new Date(),
    footer: { text: guide }
    } };
    resolve( P.send(embed, 30) );
  })
  .then(x=> { S.finish() });
}
function reset_run (S, key) {
  const R = S.root, P = S.par;
  new Promise ( async resolve => {
    let BOX;
    await R.box.cash(key).then( box => { BOX = box });
    if (BOX.isNew() || BOX.get('history').length < 1) {
      return resolve
          (P.reply(`履歴は既に無いみたいよ💢\n\`${ver}\``, 5));
    }
    BOX.set('history', []);
    BOX.prepar();
    resolve(P.reply('さいころの履歴を消去したよ。', 10));
  })
  .then(x=> { S.finish() });
}
function dice (S, BOX, n) {
  const T = S.tool;
  if (n < C.min) n = C.min;
  if (n > C.max) n = C.max;
  const history = BOX.get('history');
  const result = Math.floor(Math.random() * n)+ 1;
  history.unshift({ time: T.unix(), dice: result });
  const max = C.history;
  if (history.length > max) history.splice(max, history.length);
  BOX.set('history', history);
  BOX.prepar();
  return { args: n, dice: result };
}
