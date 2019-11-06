//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const js  = 'ytaOmiKuji.js';
const ver = `yko/Twitch/${js} v191015.01`;
//
const CashTTL = (24* 60),
  InitShuffle = 10,
   MaxShaffle = 10,
     BaseLott = [
  { name: '大々吉', num:   3 },
  { name: '大吉',   num:   6 },
  { name: '吉',     num:  10 },
  { name: '中吉',   num:  14 },
  { name: '小吉',   num:  22 },
  { name: '半吉',   num:  30 },
  { name: '末吉',   num:  42 },
  { name: '末小吉', num:  58 },
  { name: '平',     num:  81 },
  { name: '凶',     num: 113 },
  { name: '小凶',   num:  80 },
  { name: '半凶',   num:  56 },
  { name: '末凶',   num:  40 },
  { name: '大凶',   num:  28 },
  { name: '大凶',   num:  20 },
  { name: '大々凶', num:  16 },
  { name: '激凶',   num:  12 }
];
const BaseKeys = { id: `TWITCH_APP_OMIKUJI` };
//
let R, P, S;
module.exports.Unit = function (p, Ref) {
  R = p.root, P = p;
  S = P.unitKit('app:omikuji', this, P, Ref);
//S.tr(P.handler().say('test'));
  S.ver = ver;
  S.run = crum => {
    S.tr3('[Twitch:app] sp:run', crum);
    if (crum.match(/^help\s*?$/i)) {
      run_help();
    } else if (crum.match(/^rand\s*(\d*)\s*?$/i)) {
      run_shuffle(RegExp.$1);
    } else {
      run_omikuji(crum);
    }
  };
}
function PF () { return R.brain.prefix() }
function run_help () {
  P.reply(`HELP>> `
    + `${PF()}ok で「おみくじ」が引けます。`
    + `${PF()}ok rand [数字] で、[数字]回シャッフルします。`
  ).then(x=> R.finish() );
}
function run_omikuji (crum) {
  const CH = P.channel(),
     dName = P.dispName();
  S.tr3('[Twitch:app] sp:run_omikuji');
  box( BOX => {
    if (BOX.hasNew()) initDB(BOX);
    const Lott = BOX.get('bowl');
    if (Lott.length < 1) Lott = initDB(BOX);
     const Kuji = Lott.shift();
     const Left = Lott.filter(x=> x.name == Kuji.name).length;
    const Lsize = BOX.get('LottSize');
    BOX.update().prepar();
    const msg = `${dName}さん > `
    + `「${Kuji.name}」でたよ... (${Left}/${Kuji.num}/${Lsize})\n`
    + `※ ${PF()}ok rand [数字] でかき混ぜます。`;
    P.reply(msg);
    P.toDiscord(CH, S.loginID(), msg);
  });
}
function run_shuffle (num) {
  S.tr3('[Twitch:app] sp:run_shuffle');
  let sn = Number(num) || 1;
  if (sn > MaxShaffle) sn = MaxShaffle;
  box( BOX => {
    if (BOX.hasNew()) initDB(BOX);
    const Lt = BOX.get('bowl');
    BOX.set('bowl', shuffle(Lt, sn));
    BOX.prepar();
    P.reply(`おみくじを、${sn}回 かき混ぜたよ。`);
  });
}
function box (func) {
  S.tr3('[Twitch:app] sp:box');
  const Key =
    `Twitch:AppOmikuji(${P.channel()},${P.username()})`;
  return new Promise ( async resolve => {
    R.box.cash().get(Key).then(db=> resolve(func(db)) );
  })
  .then(x=> { R.finish() });
}
function initDB (BOX) {
  S.tr3('[Twitch:app] sp:initDB');
  BOX.TTL = CashTTL;
  let Lt = [], lottSize = 0;
  for (let v of S.tool.v(BaseLott)) {
    lottSize += v.num;
    [...Array(v.num)].map(()=> Lt.push(v) );
  }
  BOX.set('LottSize', lottSize);
  return BOX.set('bowl', shuffle(Lt, InitShuffle));
}
function shuffle (Lt, n) {
  S.tr3('[Twitch:app] sp:shuffle');
  [...Array(n)].map(()=> { Lt = S.tool.shuffle(Lt) });
  return Lt;
}
