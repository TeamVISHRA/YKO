//
// yko/Twitch/yChatFAKE.js
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'yChatFAKE.js';
const ver = `yko/Twitch/${my} v190929.01`;
//
module.exports = function (Y, P) {
  this.ver = ver;
	const S = this;
  S.say = (...args) => { Y.tr('say', args) };
  const ON = {};
  S.on = (key, v) => {
    Y.tr3('on', key);
    ON[key] = v;
  };
  S.connect = () => {
    if (ON.connected) ON.connected('<FAKEaddr>', 12345);
    Y.tr3('connect');
  }
  S.disconnect = () => { Y.tr3('TMIfake:disconnect') };
	//
  S.$ON = () => { return ON };
  S.$evMessage = (msg, o) => {
    if (! ON.message) Y.throw(`Unknown on.message`);
    if (! o) { o = {
      say: S.say,
      channel: '#milkyvishra',    // connect channel.
      username: 'fakeuser',       // post user.
      'display-name': 'FAKEuser'  // post user.
    } }
    return ON.message(o.channel, o, msg, false);
  };
}
