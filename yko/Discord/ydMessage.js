'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ydMessage.js';
const ver = `yko/Discord/${my} v191105`;
//
module.exports.Unit = function (P) {
  const R = P.root;
  const U = R.unitKit(my, this, P);
  const T = U.tool;
    U.ver = ver;
  U.unitKit = (nm, X, ...arg) => {
    R.unitKit(nm, X, ...arg);
    X.dir = P;
    return X;
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
  const IS = (o) => { return (TMP.is = o) };
  U.is = () => { return TMP.is };
  U.start = (handler) => {
    [H, TMP] = [handler, T.c(null)];
    let type;
    if (U.type() == 'dm') {
      U.isDM = () => {
        U.tr(`[Discord:ydM] DM - true.`);
        return true;
      };
      TMP.guild_id = TMP.channel_id = '';
       TMP.user_id = H.user.id;
         U.guildID = U.channelID = () => { return '' };
          U.userID = () => { return TMP.user_id };
        U.nickname = () => { return H.user.username  };
        U.username = () => { return H.user.username  };
       U.avatarURL = () => { return H.user.avatarURL };
      Y.tr3('[Discord:ydM] <M>.channel.type:' + (type = 'DM'));
    } else {
      U.isDM = () => {
        U.tr(`[Discord:ydM] DM - false.`);
        return false;
      };
      TMP.guild_id = H.guild.id;
       TMP.user_id = H.author.id;
         U.guildID = () => { return TMP.guild_id };
       U.channelID = () => { return TMP.channel_id };
          U.userID = () => { return TMP.user_id };
        U.nickname = () =>
          { return (H.member.nickname || H.author.username) };
        U.username = () => { return H.author.username  };
       U.avatarURL = () => { return H.author.avatarURL };
      type = TMP.channel_id = H.channel.id;
    }
    if (R.brain.isSleep(type, U.userID())) {
      R.brain.wokeup(W_CHECK, W_BOW, IS)
             .Try(type, U.userID(), H.content);
    } else {
      R.brain.isCall(H.content, IS);
    }
    return U;
  };
  let MemberDB;
  U.finish = () => {
    if (MemberDB) MemberDB.prepar();
    return P.finish();
  };
  U.App = (name, args) => {
    const JS = require(`./App/yda${name}.js`);
    return new JS.Unit (U, args);
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
  U.channelName = () => {
    return U.isDM() ? '(N/A)': H.channel.name;
  };
  U.discriminator = () => {
    return U.isDM() ? H.user.discriminator
                    : H.author.discriminator;
  };
  U.account = () => {
    let name = U.username()
             || U.throw(ver, 'Unknown username');
    let disc = U.discriminator()
             || U.throw(ver, 'Unknown discriminator');
    return `${name}#${disc}`;
  };
  U.channelGET = (id) => {
    U.tr3('[Discord:ydM] channelGET', id);
    return H.guild.channels.get(id);
  };
  U.userGET = (id) => {
    U.tr3('[Discord:ydM] userGET', id);
    return H.users.get(id);
  };
  U.setDMnotice = (n) => {
    U.tr3('[Discord:ydM] setDMnotice');
    if (! n && n != 0) return TMP.setDMnotice;
    TMP.setDMnotice = n == 1 ? 'ＤＭを送ったよ!!': n;
    return TMP.setDMnotice;
  };
  U.DMsend = (msg, a) => {
    if (! U.isDM() && U.setDMnotice()) {
      U.tr3('[Discord:ydM] DMsend (notice):' + TMP.setDMnotice);
      U.reply(TMP.setDMnotice, a);
    }
    U.tr3(`[Discord:ydM] <M>.author.send:`, msg);
    return H.author.send( MSG_WARP(msg) );
  };
  U.channelSend = (id, msg, a) => {
    let ch = U.channelGET(id)
          || U.throw(ver, 'YKO> Invalid channel ID');
    U.tr3(`[Discord:ydM] <Ch>.Send: [${id}]`, msg);
    return SEND(m=> { return ch.send(m) }, msg, a);
  };
  U.send = (msg, a) => {
    if (U.isDM()) return U.DMsend(msg, a);
    U.tr3(`[Discord:ydM] <M>.channel.send:`, msg);
    return SEND(m=> { return H.channel.send(m) }, msg, a);
  };
  U.reply = (msg, a) => {
    if (U.isDM()) return U.DMsend(msg, a);
    U.tr3(`[Discord:ydM] <M>.reply: ${msg}`);
    return SEND(m=> { return H.reply(m) }, msg, a);
  };
  let SEND = (func, msg, a) => {
    return func(MSG_WARP(msg)).then(P.send2callback(a));
  };
  if (U.debug()
      && P.conf.debug_level && P.conf.debug_level > 1) {
    const DBGsend = SEND;
    const id = U.devel_channelID();
    SEND = (func, msg, a) => {
      ch = U.channelGET(id);
      U.tr3('[Discord:ydM] Debug Channel: ' + id);
      return DBGsend(m=> { return ch.send(m) }, msg, a);
    };
  }
  U.content = () => { return H.content || '' };
  U.handler = () => { return H };
  U.delete  = () => { H.delete() };
  // === test ==========================================
  U.reAction = (react) => {
    U.tr1('[Discord:ydM] reAction');
    return H.react(react);
  };
  U.findGuildMember = (id) => {
    if (U.isDM()) return false;
    U.tr2('[Discord:ydM] <M>.guild.members.find', id);
    return (H.guild.members.find('name', id) || false);
  };
  U.findGuildRole = (name) => {
    if (U.isDM()) return false;
    U.tr2('[Discord:ydM] <M>.guild.roles.find', name);
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
    U.toTwitch = (uname, msg, func) => {
      return new Promise (async (resolve, reject) => {
        if (U.isDM()) return reject
          ({ YKO:1, result: 'Not available from DM' });
        let cf;
        await R.sysDB(`Discord.${U.guildID()}`)
                 .cash('toTwitch').then(x=> cf = x );
        U.tr5('[Discord:ydM] sysDB: ', cf);
        if (! cf) return reject
          ({ YKO:1, result: 'Configuration not setup.' });
        if (! func) func = (check, uid) => {
          return check == uid ? true : false;
        };
        U.tr3('[Discord:ydM] toTwitch', 'check');
        if (! func(cf.fromCH, U.channelID())) {
          U.tr3('[Discord:ydM] toTwitch', 'Cancel !!');
          return reject({ YKO:1, result: 'cancel' });
        }
        msg = T.tmpl(cf.message, {
          name: (uname || U.nickname()),
          message: T.Zcut((msg || U.content()), 400, '...')
        });
        return R.Twitch.say(cf.toCH, msg).then(x=> {
          resolve({ from:cf.fromCH, to:cf.toCH });
        }).catch(e=> U.throw(`[Discord:toTwitch]`, e));
      });
    };
  } else {
    U.toTwitch = async () => {};
  }
  U.memberNow = async () => {
    if (MemberDB) return MemberDB;
    const Gid = U.guildID()
    || U.throw(`[Discord:ydM] memberNow: Unknown guildID.`);
    await U.root.sysDB(`Discord`)
    .member(`${Gid}.${U.userID()}`).then(x=> MemberDB = x);
    return MemberDB;
  };
  U.every = () => {
    U.tr3('[Discord:ydM] every');
    U.toTwitch(U.nickname(), U.content()).then(x=> {
      U.$countUpMemberDB(1).then(x=> U.finish());
    }) .catch(e=> {
      if (e && T.isHashArray(e) && e.YKO) {
        if (e.result)
          U.tr4(`[Discord:ydM] toTwitch:`, e.result);
        U.$countUpMemberDB(0).then(x=> U.finish());
      } else {
        U.throw(`[Discord:ydM]`, e);
      }
    });
  };
  U.$countUpMemberDB = (Twitch) => {
    return U.memberNow().then(box=> {
      box.util().inc('countPost')
         .util().setDefault('tmLastPost');
    });
  };
}
