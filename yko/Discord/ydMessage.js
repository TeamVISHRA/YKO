'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ydMessage.js';
const ver = `yko/Discord/${my} v191010.01`;
//
module.exports = function (Y, P) {
   const U = this;
     U.ver = ver;
   const R = U.root = P.root;
  U.parent = P;
   const T = Y.tool;
 U.App = (name, args) => {
		const JS = require(`./App/yda${name}.js`);
		return new JS (Y, U, args);
	};
	let [TMP, H] = [{}];
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
  const W_CHECK = (wo, h, id) => {
    if (U.guildOnerID() == U.userID()) return true;
    return false;
  };
  const W_BOW = (wo) => { U.send('おはよう！！', 20) };
  U.start = (handler) => {
    [H, TMP] = [handler, {}];
    let type;
    if (U.type() == 'dm') {
     U.isDM       = () => { return true };
      TMP.guild_id = TMP.channel_id = '';
      TMP.user_id  = H.user.id;
     U.guildID =U.channelID = () => { return '' };
     U.userID = () => { return TMP.user_id };
      Y.tr3('<Meaage>.channel.type:' + (type = 'DM'));
    } else {
     U.isDM       = () => { return false };
      TMP.guild_id = H.guild.id;
      TMP.user_id  = H.author.id;
      U.guildID    = () => { return TMP.guild_id };
      U.channelID  = () => { return TMP.channel_id };
      U.userID     = () => { return TMP.user_id };
      type = TMP.channel_id = H.channel.id;
    }
    if (R.brain.isSleep(type, U.userID())) {
      R.brain.wokeup(W_CHECK, W_BOW)
             .Try(type, U.userID(), H.content);
    } else {
      R.brain.isCall(H.content);
    }
    return U;
	};
  U.type = () => { return H.channel.type };
  U.guildName = () => {
    return U.isDM() ? '(N/A)': H.guild.name;
  };
  U.guildOnerID = () => {
    return U.isDM() ? '(N/A)': H.guild.ownerID;
  };
  U.guildIconURL = () => {
    return U.isDM() ? '': (H.guild.iconURL || '');
  };
  U.guildMemberCount = () => {
    return U.isDM() ? 0 : (H.guild.memberCount || 0);
  };
  U.nickname = () => { return U.isDM()
    ? U.username(): (H.member.nickname || U.username());
  };
  U.channelName = () => {
    return U.isDM() ? '(N/A)': H.channel.name;
  };
  U.username = () => {
    return U.isDM() ? H.user.username: H.author.username;
  };
  U.discriminator = () => {
    return U.isDM() ? H.user.discriminator
                  : H.author.discriminator;
  };
  U.avatarURL = () => {
    return U.isDM() ? H.user.avatarURL : H.author.avatarURL;
  };
  U.account = () => {
    let name = U.username()
             || Y.throw(ver, 'Unknown username');
    let disc = U.discriminator()
             || Y.throw(ver, 'Unknown discriminator');
    return `${name}#${disc}`;
  };
  U.channelGET = (id) => {
    Y.tr3('channelGET', id);
    return H.guild.channels.get(id);
  };
  U.userGET = (id) => {
    Y.tr3('userGET', id);
    return H.users.get(id);
  };
  U.setDMnotice = (n) => {
    Y.tr3('setDMnotice');
    if (! n && n != 0) return TMP.setDMnotice;
    TMP.setDMnotice = n == 1 ? 'ＤＭを送ったよ!!': n;
    return TMP.setDMnotice;
  };
  U.DMsend = (msg, a) => {
    if (! U.isDM() && U.setDMnotice()) {
      Y.tr3('DMsend (notice):' + TMP.setDMnotice);
      U.reply(TMP.setDMnotice, a);
    }
    Y.tr3(`<Message>.author.send:`, msg);
    return H.author.send( MSG_WARP(msg) );
  };
  U.channelSend = (id, msg, a) => {
    let ch = U.channelGET(id)
          || Y.throw(ver, 'YKO> Invalid channel ID');
    Y.tr3(`<channel>.Send: [${id}]`, msg);
    return SEND(m=> { return ch.send(m) }, msg, a);
  };
  U.send = (msg, a) => {
    if (U.isDM()) return U.DMsend(msg, a);
    Y.tr3(`<Message>.channel.send:`, msg);
    return SEND(m=> { return H.channel.send(m) }, msg, a);
  };
  U.reply = (msg, a) => {
    if (U.isDM()) return U.DMsend(msg, a);
    Y.tr3(`<Message>.reply: ${msg}`);
    return SEND(m=> { return H.reply(m) }, msg, a);
  };
  let SEND = (func, msg, a) => {
    return func(MSG_WARP(msg)).then(P.send2callback(a));
  };
  if (Y.debug()
      && P.im.debug_level && P.im.debug_level > 1) {
    const DBGsend = SEND;
    const id = U.devel_channelID();
    SEND = (func, msg, a) => {
      ch = U.channelGET(id);
      Y.tr3('Debug Channel: ' + id);
      return DBGsend(m=> { return ch.send(m) }, msg, a);
    };
  }
  U.content = () => { return H.content || '' };
  U.handler = () => { return H };
  U.delete  = () => { H.delete() };
  // === test ==========================================
  U.reAction = (react) => {
    Y.tr1('reAction');
    return H.react(react);
  };
  U.findGuildMember = (id) => {
    if (U.isDM()) return false;
    Y.tr2('<Message>.guild.members.find', id);
    return (H.guild.members.find('name', id) || false);
  };
  U.findGuildRole = (name) => {
    if (U.isDM()) return false;
    Y.tr2('<Message>.guild.roles.find', name);
    return (H.guild.roles.find('name', name) || false);
  };
  // === test ==========================================
  U.guildID   = () => {
    return (TMP.guild_id || H.guild.id || '');
  };
  U.channelID = () => {
    return (TMP.channelId || H.channel.id || '');
  };
  if (Y.rack.has('Twitch')) {
    U.toTwitch = async (uname, msg, nocheck) => {
      if (U.isDM()) return false;
      const Key = `discord.guilds.${U.guildID()}.toTwitch`;
      Y.tr3('toTwitch', Key);
      let cf;
      await R.sysDB().get(Key).then(x=> cf = x );
      Y.tr5('sysCash: ', cf);
      if (! cf) return false;
      Y.tr3('toTwitch', 'check');
      if (! nocheck && U.channelID() != cf.fromCH) {
        Y.tr3('toTwitch', 'Cancel !!');
        return;
      }
      const me = Y.im.twitch.chat.loginID;
      msg = T.tmpl(cf.message, {
        name: (uname || U.nickname()),
        message: T.byte2cut((msg || U.content()), 400, '...')
      });
      return U.root.Twitch.say(cf.toCH, me, msg)
              .then(x=> { return [cf.fromCH, cf.toCH] });
    };
  } else {
    U.toTwitch = () => {};
  }
  U.every = () => {
    Y.tr3('every');
    U.toTwitch(U.nickname(), U.content());
    R.finish();
  };
}
