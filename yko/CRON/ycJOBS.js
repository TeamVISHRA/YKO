'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ycJOBS.js';
const ver = `yko/${my} v191013.01`;
//
module.exports.Unit = function (P) {
  const S = P.root.unitKit(my, this, P.im, P.conf);
    S.ver = ver;
  const List = exports.Collect(S);
  for (let [key, func] of S.tool.e(List)) { S[key] = func }
};
module.exports.Collect = function (P) {
  const R = P.root;
  return {
    DiscordAskRefresh: () => {
      R.Discord.ask.refresh().then(x=> { R.finish() });
    },
    sysDBcleanCash: () => {
      R.sysDB().clean().then(x=> { R.finish() });
    },
    boxCleanCash: () => {
      R.box.cleanCash().then(x=> { R.finish() });
    },
    boxCleanTrash: () => {
      R.box.cleanTrash().then(x=> { R.finish() });
    },
    brainCleanSleep: () => {
      R.brain.cleanSleep().then(x=> { R.finish() });
    },
    DiscordRSS: (a) => {
      const JS = require('./ycDiscordRSS.js');
      const ydRSS = new JS.Unit (P);
      ydRSS.run();
    }
  }
}
