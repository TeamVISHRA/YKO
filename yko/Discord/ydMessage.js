//
// yko/Discord/ydMessage.js
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ydMessage.js';
const ver = `yko/Discord/${my} v190929.01`;
//
let S, Y, P, T;
module.exports = function (y, p) {
  this.ver = ver;
	[S, Y, P, T] = [this, y, p, y.tool];
  if (Y.REQ1() == 'Discord') build_component();
};
//
function build_component () {
	let [TMP, H] = [{}];
  const G = { toTwitch: {} };
  const MSG_WARP = Y.debug() ? (msg) => {
    const Stamp = '(Debug in progress)';
    if (typeof msg == 'object') {
      if (msg.embed) {
        if (msg.embed.footer && msg.embed.footer.text) {
          msg.embed.footer.text += ` ${Stamp}`;
        } else {
          msg.embed.footer = { text: Stamp };
        }
      }
      return msg;
    } else {
      return `${msg}\n\`${Stamp}\``;
    }
  }: (msg) => { return msg };
  //
  S.tmp = () => { return TMP };
  const APP = {};
	S.App = (k, arg) => {
		if (APP[k]) return APP[k];
		const LIB = require(`./App/yda${k}.js`);
		APP[k] = new LIB (Y, S, arg);
		return APP[k];
	};
  S.devel_guildID   = P.devel_guildID;
  S.devel_channelID = P.devel_channelID;
  S.devel_userID    = P.devel_userID;
  //
  S.isDM = () => {};
  S.type = () => { return H.channel.type };
  S.guildName = () => {
    return S.isDM() ? '(N/A)': H.guild.name;
  };
  S.guildOnerID = () => {
    return S.isDM() ? '(N/A)': H.guild.ownerID;
  };
  S.guildIconURL = () => {
    return S.isDM() ? '': (H.guild.iconURL || '');
  };
  S.guildMemberCount = () => {
    return S.isDM() ? 0 : (H.guild.memberCount || 0);
  };
  S.nickname = () => { return S.isDM()
    ? S.username(): (H.member.nickname || S.username());
  };
  S.channelName = () => {
    return S.isDM() ? '(N/A)': H.channel.name;
  };
  S.username = () => {
    return S.isDM() ? H.user.username: H.author.username;
  };
  S.discriminator = () => {
    return S.isDM() ? H.user.discriminator
                  : H.author.discriminator;
  };
  S.avatarURL = () => {
    return S.isDM() ? H.user.avatarURL : H.author.avatarURL;
  };
  S.account = () => {
    let name = S.username()
             || Y.throw(ver, 'Unknown username');
    let disc = S.discriminator()
             || Y.throw(ver, 'Unknown discriminator');
    return `${name}#${disc}`;
  };
  S.channelGET = (id) => {
    Y.tr2('channelGET', id);
    return H.guild.channels.get(id);
  };
  S.userGET = (id) => {
    Y.tr2('userGET', id);
    return H.users.get(id);
  };
  S.setDMnotice = (n) => {
    Y.tr1('setDMnotice');
    if (! n && n != 0) return TMP.setDMnotice;
    TMP.setDMnotice = n == 1 ? 'ＤＭを送ったよ!!': n;
    return TMP.setDMnotice;
  };
  S.DMsend = (msg, a) => {
    if (! S.isDM() && S.setDMnotice()) {
      Y.tr2('DMsend (notice):' + TMP.setDMnotice);
      S.reply(TMP.setDMnotice, a);
    }
    Y.tr2(`<Message>.author.send:`, msg);
    return H.author.send( MSG_WARP(msg) );
  };
  S.channelSend = (id, msg, a) => {
    let ch = S.channelGET(id)
          || Y.throw(ver, 'Invalid channel ID');
    Y.tr2(`<channel>.Send: [${id}]`, msg);
    return SEND(m=> { return ch.send(m) }, msg, a);
  };
  S.send = (msg, a) => {
    if (S.isDM()) return S.DMsend(msg, a);
    Y.tr2(`<Message>.channel.send:`, msg);
    return SEND(m=> { return H.channel.send(m) }, msg, a);
  };
  S.reply = (msg, a) => {
    if (S.isDM()) return S.DMsend(msg, a);
    Y.tr2(`<Message>.reply: ${msg}`);
    return SEND(m=> { return H.reply(m) }, msg, a);
  };
  let SEND = (func, msg, a) => {
    return func(MSG_WARP(msg)).then(P.send2callback(a));
  };
  if (Y.debug()
      && P.im.debug_level && P.im.debug_level > 1) {
    const DBGsend = SEND;
    const id = S.devel_channelID();
    SEND = (func, msg, a) => {
      ch = S.channelGET(id);
      Y.tr2('Debug Channel: ' + id);
      return DBGsend(m=> { return ch.send(m) }, msg, a);
    };
  }
  S.content = () => { return H.content || '' };
  S.handler = () => { return H };
  S.delete  = () => { H.delete() };
  // === test ==========================================
  S.reAction = (react) => {
    Y.tr1('reAction');
    return H.react(react);
  };
  S.findGuildMember = (id) => {
    if (S.isDM()) return false;
    Y.tr2('<Message>.guild.members.find', id);
    return (H.guild.members.find('name', id) || false);
  };
  S.findGuildRole = (name) => {
    if (S.isDM()) return false;
    Y.tr2('<Message>.guild.roles.find', name);
    return (H.guild.roles.find('name', name) || false);
  };
  // === test ==========================================
  const W_CHECK = (wo, h, id) => {
    if (S.guildOnerID() == S.userID()) return true;
    return false;
  };
  const W_BOW = (wo) => {
    S.send(wo.greeting(), 20);
  };
  S.guildID   = () => {
    return (TMP.guild_id || H.guild.id || '');
  };
  S.channelID = () => {
    return (TMP.channelId || H.channel.id || '');
  };
	S.start = (handler) => {
    Y.start(handler);
    [H, TMP] = [handler, {}];
    let type;
    if (S.type() == 'dm') {
      TMP.guild_id = TMP.channel_id = '';
      TMP.user_id = H.user.id;
      S.isDM = () => { return true };
      S.guildID = S.channelID = () => { return '' };
      S.userID = () => { return TMP.user_id };
      Y.tr2('<Meaage>.channel.type:' + (type = 'DM'));
    } else {
      TMP.guild_id = H.guild.id;
      type = TMP.channel_id = H.channel.id;
      TMP.user_id = H.author.id;
      S.isDM = () => { return false };
      S.guildID  = () => { return TMP.guild_id };
      S.channelID = () => { return TMP.channel_id };
      S.userID = () => { return TMP.user_id };
    }
    if (Y.brain.isSleep(type, S.userID())) {
      return Y.brain.wokeup(W_CHECK, W_BOW)
                    .Try(type, S.userID(), H.content);
    }
    return Y.brain.isCall(H.content);
	};
  S.rollback = Y.rollback;
  S.finish   = Y.finish;
  S.every = () => {
    S.toTwitch();
  };
  S.toTwitch = async (uname, msg, nocheck) => {
    if (S.isDM()) return false;
    Y.tr1('toTwitch');
    let c;
    await Y.sysDATA
        .cash(['discord', 'guilds', S.guildID(), 'toTwitch'])
        .then( db => { c = db.value });
    Y.tr4('sysCash: ', c);
    if (! c) return false;
    Y.tr2('toTwitch', 'check');
    if (! nocheck && S.channelID() != c.fromCH) return;
    msg = T.byte2cut((msg || S.content()), 400, '...');
    return Y.Twitch.Chat().say(c.toCH, T.tmpl(c.message,
        { name: (uname || S.nickname()), message: msg }) )
        .then(o => { return [c.fromCH, c.toCH, msg] });
  };
}
