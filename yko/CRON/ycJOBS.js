'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ycJOBS.js';
const ver = `yko/${my} v191201`;
//
module.exports.Collect = P => {
  const R = P.root;
  const JOBS = {
    DiscordRSS: () => {
      const JS = require('./ycDiscordRSS.js');
      const ydRSS = new JS.Unit (P);
      ydRSS.run();
    },
    DiscordAskRefresh: () => {
      R.Discord.ask.refresh().then(x=> { R.finish() });
    },
    boxCleanCash: () => {
      R.box.cash().clean().then(x=> { R.finish() });
    },
    boxCleanTrash: () => {
//      const JS = require('../BOX/ybTRASH.js');
//      const ybTRASH = new JS.Unit (P);
//      ybTRASH.clean().then(x=> { R.finish() });
    },
    cleanProcCash: () => {
      R.procCash().clean().then(x=> { R.finish() });
    },
    brainCleanSleep: () => {
      R.brain.cleanSleep().then(x=> { R.finish() });
    },
    liquidReport: () => {
      R.Liquid.report().then(x=> R.finish() );
    },
    liquidClean: () => {
      R.box.asset().cleanLimit(2* 31).then(x=> R.finish() );
    }
  }
  return JOBS;
}
