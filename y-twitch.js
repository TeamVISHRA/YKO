#!/usr/local/bin/node
'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const ver = `y-twitch.js v191015.01`;
//
const yko = require('yko'); // require('./yko/CORE.js');
const Y = new yko ();

advance();

Y.Twitch.DebugCall().run()
  .then(Y.Next).catch(e => { Y.throw(e) });

function include () {
Y.init('yTwitch', 'yDiscord');
}
function advance () {
// ===== < Twitch > =====
Y.on('twitch_chat_message', (ytM, is) => {
  if (! is.cmd) return ytM.every();
  switch (is.cmd) {
    case 'ok':
      ytM.App('OmiKuji').run(is.crum);
      break;
    default:
//      ytM.App('Help').run();
      break;
  }
});
include();
}
