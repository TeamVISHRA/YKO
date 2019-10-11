'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ycJOBS.js';
const ver = `yko/${my} v191009.01`;
//
module.exports.Worker = function (Y, P) {
  const S = this;
    S.ver = ver;
  const R = P.root;
  const T = Y.tool;
  const List = exports.Collect(Y, R, P);
  for (let [key, func] of T.e(List)) { S[key] = func }
};
module.exports.Collect = function (Y, R, P) {
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
      (new JS (Y, R, P)).run();
    }
  }
}
