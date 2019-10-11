#!/usr/local/bin/node
'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const ver = `y-twitch.js v191010.01`;
//
const yko = require('yko'); // require('./yko/CORE.js');
const Y = new yko ();

advance();

Y.Twitch.DebugCall().run()
 .then(Y.Next)
 .catch(e => { Y.throw(ver, e) });

function include () {
Y.init('yTwitch', 'yDiscord');
}
function advance () {
// ===== < Twitch > =====
Y.on('twitch_chat_message', (yT, is) => {
  if (! is.cmd) return yT.every();
});
include();
}
