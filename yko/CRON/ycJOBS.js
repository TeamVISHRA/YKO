'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ycJOBS.js';
const ver = `yko/${my} v191008.01`;
//
module.exports = function (Y, P) {
    const S = this;
      S.ver = ver;
    const R = P.root;
  //
  S.DiscordAskGuildRefresh = () => {
    R.Discord.askGuild.refresh().then(x=> { R.finish() });
  };
  S.sysDBcleanCash = () => {
    R.sysDB().cleanCash().then(x=> { R.finish() });
  };
  S.boxCleanCash = () => {
    R.box.cleanCash().then(x=> { R.finish() });
  };
  S.boxCleanTrash = () => {
    R.box.cleanTrash().then(x=> { R.finish() });
  }; 
  S.brainCleanSleep = () => {
    R.brain.cleanSleep().then(x=> { R.finish() });
  };
  S.DiscordRSS = (a) => {
    const JS = require('./ycDiscordRSS.js');
    (new JS (Y, P.root, P)).run();
  };
};
