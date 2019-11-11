'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ydMessage.js';
const ver = `yko/Discord/${my} v191105`;
//
const Defaults = {
  twitch: {
    sizeMid:  400,
    sizeMax:  500,
    message: '👀 <name>：<message> - From Discord.'
  },
  line: {
    sizeMid:  800,
    sizeMax: 1000,
    message: `👀 <name>： <message> - From Discord`
  }
}
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
      U.tr3(`[Discord:M] DM mode !!`);
      U.isDM = () => { return true };
      TMP.guild_id = TMP.channel_id = '';
       TMP.user_id =
        (H.user ? H.user.id: (H.author ? H.author.id: '(N/A)'));
         U.guildID = U.channelID = () => { return '' };
          U.userID = () => { return TMP.user_id };
        U.nickname = () => { return H.user.username  };
        U.username = () => { return H.user.username  };
       U.avatarURL = () => { return H.user.avatarURL };
      U.tr3('[Discord:M] <M>.channel.type:' + (type = 'DM'));
    } else {
      U.isDM = () => { return false };
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
    U.toTwitch = (toCH, msg) => {
      return new Promise ( resolve => {
        if (! toCH || ! msg)
          { return resolve({ failed: 'Incomplete argument.' }) }
        if (U.isDM())
          { return resolve({ failed: 'Not available from DM' }) }
        return R.Twitch.say
        (toCH, T.Zcut(msg, Defaults.twitch.sizeMax, '...'))
          .then(x=> resolve({ success: true }))
          .catch(e=> U.throw(`[Discord:toTwitch]`, e));
      });
    };
  } else {
    U.toTwitch = async () => {};
  }
  if (U.rack.has('LINE')) {
    U.toLine = (toID, name, text) => {
      return new Promise ( resolve => {
        if (! toID || ! msg)
          { return resolve({ failed: 'Incomplete argument.' }) }
        if (U.isDM())
          { return resolve({ failed: 'Not available from DM' }) }
        return R.LINE.sayFlexStyle(toID, {
          userName: (name || U.nickname()),
              text: (text || U.content())
        }).then(x=> resolve({ success: true }))
          .catch(e=> U.throw(`[Discord:toTwitch]`, e));
      });
    };
  } else {
    U.toLine = async () => {};
  }
  U.every = () => {
    U.tr3('[Discord:ydM] every');
    const [Guid, ChID] = [U.guildID(), U.channelID()];
    if (! Guid || ! ChID) { return $finish() }
    let Conf;
    R.sysDB(`Discord.${Guid}`).cash().then(async x=> {
      Conf = x;
      await $toTwitch(Conf.toTwitch);
    }).then(async x=> {
      await $toLine(Conf.toLine);
    }).then(x=> {
      return $finish();
    }).catch(e=> {
      U.tr(`[Discord:M] every`, e);
    });
    function $toTwitch (C) {
      U.tr3
      if (! C || ! C.toCH || ! C.fromCH || ChID != C.fromCH) {
        return false;
      }
      const Def = Defaults.twitch;
      let tmpl = C.message || Def.message;
      return U.toTwitch(C.toCH, T.tmpl(tmpl, {
           name: U.nickname(),
        message: T.Zcut(U.content(), Def.sizeMid, '...')
      }));
    }
    function $toLine (C) {
      if (! C || ! C.tokens) { return false }
      let toID = C.tokens[ChID];
      if (! toID) { return false }
      const Def = Defaults.line;
      let tmpl = C.message || Def.message;  
      return U.toLine(toID).then(x=> {
        if (x && T.isHashArray(x) && x.failed)
          { U.tr3(`[Discord:M] toLine - failed:`, x.failed) }
        return x;
      });
    }
    function $finish () {
      if (! U.isDM() && U.content()) {
        U.$countUpMemberDB(0).then(x=> U.finish())
      } else {
        U.finish();
      }
    }
  };
  U.memberNow = async () => {
    if (MemberDB) return MemberDB;
    let Gid; if (Gid = U.guildID()) {
      await U.root.sysDB(`Discord`)
      .member(`${Gid}.${U.userID()}`).then(x=> MemberDB = x);
    }
    return MemberDB;
  };
  U.$countUpMemberDB = (Twitch) => {
    return U.memberNow().then(box=> {
      if (! box) return;
      box.util().inc('countPost')
         .util().setDefault('tmLastPost');
    });
  };
}
