//
// y-twitch.js
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const ver = 'y-twitch.js v190915.01';
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
Y.init([['yTwitch'], 'yDiscord']);
//
Y.Twitch.run();
