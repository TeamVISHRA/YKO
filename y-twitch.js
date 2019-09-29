//
// y-twitch.js
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const ver = 'y-twitch.js v190930.01';
//
const yko = require('./yko/CORE.js');
const Y = new yko ();

// ===== < Twitch > =====
Y.on('twitch_chat_message', (TC, is) => {
	let i; if (i = is.cmd) {

	} else {
		TC.every(is);
	}
});
// ===== < INIT > ========
Y.init('yTwitch:init', 'yDiscord');
// ===== < Debug > =======
//Y.preparFake();
// ===== < Execute > =====
Y.Twitch.run()
//.then(test=> { test.$evMessage('あいうえお') });
