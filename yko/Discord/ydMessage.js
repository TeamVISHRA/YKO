'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ydMessage.js';
const ver = `yko/Discord/${my} v191013.01`;
//
module.exports.Unit = function (P) {
   const R = P.root;
   const U = R.unitKit(my, this, P.im, P.conf);
     U.ver = ver;
  U.parent = P;
   const T = U.tool;
  U.App = (name, args) => {
    const JS = require(`./App/yda${name}.js`);
    return new JS (U, args);
  };
  let [TMP, H] = [{}];
  const MSG_WARP = U.debug() ? (msg) => {
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
             || U.throw(ver, 'Unknown username');
    let disc = U.discriminator()
             || U.throw(ver, 'Unknown discriminator');
    return `${name}#${disc}`;
  };
  U.channelGET = (id) => {
    U.tr3('channelGET', id);
    return H.guild.channels.get(id);
  };
  U.userGET = (id) => {
    U.tr3('userGET', id);
    return H.users.get(id);
  };
  U.setDMnotice = (n) => {
    U.tr3('setDMnotice');
    if (! n && n != 0) return TMP.setDMnotice;
    TMP.setDMnotice = n == 1 ? 'ＤＭを送ったよ!!': n;
    return TMP.setDMnotice;
  };
  U.DMsend = (msg, a) => {
    if (! U.isDM() && U.setDMnotice()) {
      U.tr3('DMsend (notice):' + TMP.setDMnotice);
      U.reply(TMP.setDMnotice, a);
    }
    U.tr3(`<Message>.author.send:`, msg);
    return H.author.send( MSG_WARP(msg) );
  };
  U.channelSend = (id, msg, a) => {
    let ch = U.channelGET(id)
          || U.throw(ver, 'YKO> Invalid channel ID');
    U.tr3(`<channel>.Send: [${id}]`, msg);
    return SEND(m=> { return ch.send(m) }, msg, a);
  };
  U.send = (msg, a) => {
    if (U.isDM()) return U.DMsend(msg, a);
    U.tr3(`<Message>.channel.send:`, msg);
    return SEND(m=> { return H.channel.send(m) }, msg, a);
  };
  U.reply = (msg, a) => {
    if (U.isDM()) return U.DMsend(msg, a);
    U.tr3(`<Message>.reply: ${msg}`);
    return SEND(m=> { return H.reply(m) }, msg, a);
  };
  let SEND = (func, msg, a) => {
    return func(MSG_WARP(msg)).then(P.send2callback(a));
  };
  if (U.debug()
      && P.im.debug_level && P.im.debug_level > 1) {
    const DBGsend = SEND;
    const id = U.devel_channelID();
    SEND = (func, msg, a) => {
      ch = U.channelGET(id);
      U.tr3('Debug Channel: ' + id);
      return DBGsend(m=> { return ch.send(m) }, msg, a);
    };
  }
  U.content = () => { return H.content || '' };
  U.handler = () => { return H };
  U.delete  = () => { H.delete() };
  // === test ==========================================
  U.reAction = (react) => {
    U.tr1('reAction');
    return H.react(react);
  };
  U.findGuildMember = (id) => {
    if (U.isDM()) return false;
    U.tr2('<Message>.guild.members.find', id);
    return (H.guild.members.find('name', id) || false);
  };
  U.findGuildRole = (name) => {
    if (U.isDM()) return false;
    U.tr2('<Message>.guild.roles.find', name);
    return (H.guild.roles.find('name', name) || false);
  };
  // === test ==========================================
  U.guildID   = () => {
    return (TMP.guild_id || H.guild.id || '');
  };
  U.channelID = () => {
    return (TMP.channelId || H.channel.id || '');
  };
  if (U.rack.has('Twitch')) {
    U.toTwitch = async (uname, msg, nocheck) => {
      if (U.isDM()) return false;
      const Key = `discord.guilds.${U.guildID()}.toTwitch`;
      U.tr3('toTwitch', Key);
      let cf;
      await R.sysDB().get(Key).then(x=> cf = x );
      U.tr5('sysCash: ', cf);
      if (! cf) return false;
      U.tr3('toTwitch', 'check');
      if (! nocheck && U.channelID() != cf.fromCH) {
        U.tr3('toTwitch', 'Cancel !!');
        return;
      }
//      const me = U.un.im.twitch.chat.loginID;
      msg = T.tmpl(cf.message, {
        name: (uname || U.nickname()),
        message: T.byte2cut((msg || U.content()), 400, '...')
      });
      return U.root.Twitch.say(cf.toCH, msg)
              .then(x=> { return [cf.fromCH, cf.toCH] });
    };
  } else {
    U.toTwitch = () => {};
  }
  U.every = () => {
    U.tr3('every');
    U.toTwitch(U.nickname(), U.content());
    U.finish();
  };
}
