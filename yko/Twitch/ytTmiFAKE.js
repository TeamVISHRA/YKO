'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ytTmiFAKE.js';
const ver = `yko/Twitch/${my} v191015.01`;
//
module.exports.call = function (P, ARGV) {
  const Y = P.un;
  Y.tr3('[Twitch:F] Debug:call', ARGV);
  Y.onFake();
  switch (ARGV.shift()) {
    case 'evM':
      Y.Next = x => { x.$evMessage(ARGV.join(' ')) };
      break;
    default:
      Y.tr('[Twitch:F] Is command wrong ?');
      Y.exit();
  }
  return P;
};
module.exports.on = function (Y) {
  this.ver = ver;
	const S = this;
  S.say = async (...args) => {
    return Y.tr('[Twitch:F] say', ...args);
  };
  const ON = {};
  S.on = (key, func) => {
    Y.tr3('[Twitch:F] on', key);
    ON[key] = func;
  };
  S.connect = () => {
    if (ON.connected) ON.connected('<FAKEaddr>', 12345);
    Y.tr3('[Twitch:F] connect');
  }
  S.disconnect = () => { Y.tr3('[Twitch:F] disconnect') };
	//
  S.$ON = () => { return ON };
  S.$evMessage = (msg) => {
    Y.tr3('[Twitch:F] >> Event Test Ready ...');
    if (! ON.message)
      Y.throw('[Twitch:F] Unknown', 'on.twitch_chat_message');
    const context = {
      say: S.say,
      channel: '#milkyvishra',    // connect channel.
      username: 'fakeuser',       // post user.
      'display-name': 'FAKEuser'  // post user.
    }
    return ON.message
        (context.channel, context, msg, false);
  };
}
