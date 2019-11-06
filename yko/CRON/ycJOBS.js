'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ycJOBS.js';
const ver = `yko/${my} v191024`;
//
module.exports.Collect = P => {
  const R = P.root;
  const JOBS = {
    DiscordAskRefresh: () => {
      R.Discord.ask.refresh().then(x=> { R.finish() });
    },
    cleanProcCash: () => {
      R.procCash().clean().then(x=> { R.finish() });
    },
    boxCleanCash: () => {
      R.box.cash().clean().then(x=> { R.finish() });
    },
    brainCleanSleep: () => {
      R.brain.cleanSleep().then(x=> { R.finish() });
    },
    boxCleanTrash: () => {
      const JS = require('../BOX/ybTRASH.js');
      const ybTRASH = new JS.Unit (P);
      ybTRASH.clean().then(x=> { R.finish() });
    },
    DiscordRSS: () => {
      const JS = require('./ycDiscordRSS.js');
      const ydRSS = new JS.Unit (P);
      ydRSS.run();
    }
  }
  return JOBS;
}
