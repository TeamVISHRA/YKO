'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'markingTalk.js';
const ver = `yko/lib/${my} v191125`;
//
const LevelBreak = 1000;
const base = {
	'名詞'  : [ 20, 100,  30,  20,  10,   5,   0,  -10,  -20],
	'助詞'  : [ 20,  30,  10,   5,   0,  -5, -10,  -20,  -40],
	'動詞'  : [ 15,  30,   5,   0, -10, -20, -30,  -40,  -50],
	'助動詞': [ 20,  30,  10,   5,   0,   0, -10,  -20,  -30],
  '形容詞': [ 30, -20, -30, -40, -50, -60, -70,  -80,  -80],
	'記号'  : [  5,  15,  10,   5,   0,  -5, -10,  -15,  -30],
  '感動詞': [ 20,  10,   0, -10, -20, -30, -40,  -50,  -60],
'フィラー': [-70, -80, -90,-100,-110,-120,-130, -140, -150]
};
const last = base['名詞'].length - 1;
const EmojiStyle = {
  discord: new RegExp(/\\s*\\:[A-Za-z0-9\\_\\-]+\\:\\s*/)
};
module.exports.Unit = function (R) { // R = unit root.
  const T = R.un.tool;
     this.Level = Level;
 this.TalkPoint = TalkPoint;
  //
  async function Level (str, level, pointNow) {
    if (! level && level != 0) level = 0;
    if (! pointNow) pointNow = 0;
    let result; await TalkPoint(str).then(x=> {
      let point = x.point + pointNow;
      if (point > LevelBreak) {
        point -= LevelBreak;
        ++level;
      }
      result = { is: x, point: point, level: level };
    });
    return result;
  }
  async function TalkPoint (str) {
    str = T.canon(str);
    const URLs = [],
        Emojis = [],
        Analys = {},
          Bowl = {},
        Result = {
       point: 0,
   targetStr: 0,
targetLength: 0,
    analysis: {},
        urls: [],
      emojis: []
    };
    if (! str) return result(Result);
    let TargetStr = str.replace(
      /\s*https?\:\/\/[!-~]+\s*/g,
      x=> { URLs.push(T.canon(x)); return ' ' }
    );
    for (let [key, reg] of T.e(EmojiStyle)) {
      TargetStr = TargetStr.replace(reg, x=> {
        Emojis.push([key, T.canon(x)]);
        return ' ';
      });
    }
    let Point = URLs.length* (URLs.length > 5 ? 30: -10);
    Point += Emojis.length* (Emojis.length > 5 ? 15: -15);
    TargetStr = T.canon(TargetStr);
    if (! TargetStr) return result({ ...Result,
       point: Point,
        urls: URLs,
      emojis: Emojis
    });
    for (let pos of T.k(base))
        { Bowl[pos] = { total: 0, class: 0 } }
    await R.brain.txt2token(TargetStr).then(x=> {
      let val;
      Analys.Base = x;
      for (let v of x) {
        if (val = Bowl[v.pos]) {
          if (! val[v.surface_form]) {
            val[v.surface_form] = 0;
            ++val.class;
          }
          ++val[v.surface_form];
          ++val.total;
        }
      }
      Analys.Orign = Bowl;
    });
    for (let [pos, v] of T.e(Bowl)) {
      if (! v.class) continue;
      const rates = base[pos];
      [...Array(v.class)].map((_, i) => {
        let add = i < last ? rates[i]: rates[last];
        Point += add;
      });
    }
    return {
       point: (Point < 1 ? 0: Point),
   targetStr: TargetStr,
targetLength: TargetStr.length,
    analysis: Analys,
        urls: URLs,
      emojis: Emojis
    };
  }
}
