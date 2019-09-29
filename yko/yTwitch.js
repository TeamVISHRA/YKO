//
// yko/yTwitch.js
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'yTwitch.js';
const ver = `yko/${my} v190929.01`;
//
module.exports = function (Y) {
  this.ver = ver;
	const S = this;
	S.conf = Y.conf.twitch;
  S.im = Y.im.twitch;
  const COPMS = {};
	S.init = () => {
    Y.tr4('init');
	  for (let k of ['ytChat']) {
      let key = (k.match(/^yt(.+)/))[1];
		  S[key] = () => {
			  if (COPMS[key]) return COPMS[key];
			  let JS = require(`./Twitch/${k}.js`);
			  return (COPMS[key] = new JS (Y, S));
		  };
      Y.tr4('init: Create component', key);
	  }
    if (Y.REQ1() == 'Twitch'
     || Y.REQ1() == 'Discord') S.Chat().init();
	};
  S.preparFake = () => {
    for (let o of Object.values(COPMS))
    { if (o.preparFake) o.preparFake() }
  };
}
