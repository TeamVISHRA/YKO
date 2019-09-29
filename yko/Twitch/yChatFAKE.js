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
  S.say = (...args) => { Y.tr('TMIfake:say', args) };
  const ON = {};
  S.on = (key, v) => {
    Y.tr('TMIfake:on', type);
    ON[key] = v;
  };
  S.ON = () => { return ON };
  S.connect = () => {
    if (ON.connected) ON.connected('addr:FAKE', 12345);
    Y.tr('TMIfake:connect');
  }
  S.disconnect = () => { Y.tr('TMIfake:disconnect') };
  S.evMessage = (msg, o) => {
    if (! ON.message) Y.throw(`Unknown on.message`);
    if (! o) { o = {
        say: TF.say,
        channel: '#fake',
        username: 'fakeuser',
        'display-name': 'FakeUser'
    } }
    return ON.message(o.channel, o, msg, false);
  };
}
