//
// y-twitch.js
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const ver = 'y-twitch.js v190929.01';
//
const yko = require('./yko/CORE.js');
const Y = new yko ();
//
Y.on('twitch_chat_message', (TC, is) => {
	let i; if (i = is.cmd) {

	} else {
		TC.every(is);
	}
});
//
Y.init('yTwitch:init', 'yDiscord');
//
Y.preparFake();
//
Y.Twitch.run()
//
.then(test=> { test.evMessage('あいうえお') });
