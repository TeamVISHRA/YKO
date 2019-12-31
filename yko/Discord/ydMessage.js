'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ydMessage.js';
const ver = `yko/Discord/${my} v191202`;
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
    message: `👀 <name>： <message> - From Discord.`
  }
}
module.exports.Unit = function (P) {
  const R = P.root;
  const U = R.unitKit(my, this, P);
  const T = U.tool;
    U.ver = ver;
  let H, MemberDB, SEND, MSG_WARP, TMP = {};
  if (U.debug()) {
    MSG_WARP = DBG_MSG_WARP;
    if (P.conf.debug_level && P.conf.debug_level > 1) {
      const DBGsend = SEND;
      const id = U.devel_channelID();
      SEND = (func, msg, a) => {
        ch = U.channelGET(id);
        U.tr3('[Discord:ydM] Debug Channel: ' + id);
        return DBGsend(m=> { return ch.send(m) }, msg, a);
      };
    } else { UNDEBUG() }
  } else { UNDEBUG() }
  //
         U.is = () => { return TMP.is };
    U.unitKit = unitKit;
      U.start = start;
     U.finish = finish;
        U.App = App;
    U.account = account;
 U.channelGET = channelGET;
    U.userGET = userGET;
U.setDMnotice = setDMnotice;
U.channelSend = channelSend;
       U.send = send;
      U.reply = reply;
    U.content = content;
    U.guildID = guildID;
  U.channelID = channelID;
    U.handler = () => { return H };
     U.delete = () => { return H.delete() };
       U.type = () => { return H.channel.type };
      U.every = every;
  U.memberNow = memberNow;
   U.toTwitch = U.rack.has('Twitch') ? toTwitch: (async () => {});
     U.toLine = U.rack.has('LINE') ? toLine: (async () => {});
U.$countUpMemberDB = $countUpMemberDB;
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
  function channelGET (id) {
    U.tr3('[Discord:ydM] channelGET', id);
    return H.guild.channels.get(id);
  }
  function userGET (id) {
    U.tr3('[Discord:ydM] userGET', id);
    return H.users.get(id);
  }
  function setDMnotice (n) {
    U.tr3('[Discord:ydM] setDMnotice');
    if (! n && n != 0) return TMP.setDMnotice;
    TMP.setDMnotice = n == 1 ? 'ＤＭを送ったよ!!': n;
    return TMP.setDMnotice;
  }
  function channelSend (id, msg, a) {
    let ch = U.channelGET(id)
          || U.throw(ver, 'YKO> Invalid channel ID');
    U.tr3(`[Discord:ydM] <Ch>.Send: [${id}]`, msg);
    return SEND(m=> { return ch.send(m) }, msg, a);
  }
  function send (msg, a) {
    if (U.isDM()) return U.DMsend(msg, a);
    U.tr3(`[Discord:ydM] <M>.channel.send:`, msg);
    return SEND(m=> { return H.channel.send(m) }, msg, a);
  }
  function reply (msg, a) {
    if (U.isDM()) return U.DMsend(msg, a);
    U.tr3(`[Discord:ydM] <M>.reply: ${msg}`);
    return SEND(m=> { return H.reply(m) }, msg, a);
  }
  function content () {
    return TMP.$content || (()=> {
      let text = H.content || '';
      if (H.attachments)
      { H.attachments.forEach(v=> { text += `\n${v.url}` }) }
      return (TMP.$content = text);
    }) ();
  }
  function guildID ()
      { return (TMP.guild_id || H.guild.id || '') }
  function channelID ()
      { return (TMP.channelId || H.channel.id || '') }
  function toTwitch (toCH, msg) {
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
  }
  function toLine (toID, name, text) {
    return new Promise ( resolve => {
      if (U.isDM())
        { return resolve({ failed: 'Not available from DM' }) }
      if (! toID)
        { return resolve({ failed: 'Incomplete argument.' }) }
      return R.LINE.flexMessageStyle(toID, {
        userName: (name || U.nickname()),
            text: (text || U.content() || '...')
      }).then(x=> resolve({ success: true }))
        .catch(e=> U.throw(`[Discord:toLine]`, e));
    });
  }
  function unitKit (nm, X, ...arg) {
    R.unitKit(nm, X, ...arg);
    X.dir = P;
    return X;
  }
  function App (name, args) {
    const JS = require(`./App/yda${name}.js`);
    return new JS.Unit (U, args);
  }
  function account () {
    let name = U.username()
             || U.throw(ver, 'Unknown username');
    let disc = U.discriminator()
             || U.throw(ver, 'Unknown discriminator');
    return `${name}#${disc}`;
  }
  function start (handler) {
    [H, TMP] = [handler, T.c(null)];
    let type = U.type() == 'dm' ? DmMode(): ChannelMode();
    if (R.brain.isSleep(type, U.userID())) {
      R.brain.wokeup
      (W_CHECK, W_BOW, IS).Try(type, U.userID(), H.content);
    } else {
      R.brain.isCall(U.content(), IS);
    }
    return U;
  }
  function DmMode () {
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
       U.guildName = () => { return '(N/A)' };
     U.guildOnerID = () => { return '(N/A)' };
    U.guildIconURL = () => { return '' };
U.guildMemberCount = () => { return 0 };
     U.channelName = () => { return '(N/A)' };
   U.discriminator = () => { return H.user.discriminator };
    U.DMsend = (msg, a) => {
      U.tr3(`[Discord:ydM] <M>.author.send:`, msg);
      return H.author.send( MSG_WARP(msg) );
    };
    return 'DM';
  }
  function ChannelMode () {
            U.isDM = () => { return false };
      TMP.guild_id = H.guild.id;
       TMP.user_id = H.author.id;
         U.guildID = () => { return TMP.guild_id };
       U.channelID = () => { return TMP.channel_id };
          U.userID = () => { return TMP.user_id };
          U.member = () => { return H.member };
        U.nickname = () =>
         { return (H.member.nickname || H.author.username) };
        U.username = () => { return H.author.username  };
       U.avatarURL = () => { return H.author.avatarURL };
       U.guildName = () => { return H.guild.name };
     U.guildOnerID = () => { return H.guild.ownerID };
    U.guildIconURL = () => { return (H.guild.iconURL || '') };
U.guildMemberCount = () => { return (H.guild.memberCount || 0) };
     U.channelName = () => { return H.channel.name };
   U.discriminator = () => { return H.author.discriminator };
    U.DMsend = (msg, a) => {
      if (U.setDMnotice()) {
        U.tr3('[Discord:ydM] DMsend (notice):' + TMP.setDMnotice);
        U.reply(TMP.setDMnotice, a);
      }
      U.tr3(`[Discord:ydM] <M>.author.send:`, msg);
      return H.author.send( MSG_WARP(msg) );
    }
    return (TMP.channel_id = H.channel.id);
  }
  function finish () {
    if (MemberDB) MemberDB.prepar();
    return P.finish();
  }
  function every () {
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
      U.tr3(`[Discord:M] $toTwitch`);
      if (! C || ! C.toCH || ! C.fromCH || ChID != C.fromCH) {
        return false;
      }
      U.tr3(`[Discord:M] $toTwitch - To:`, C.toCH);
      const Def = Defaults.twitch;
      let tmpl = C.message || Def.message;
      return U.toTwitch(C.toCH, T.tmpl(tmpl, {
           name: U.nickname(),
        message: T.Zcut(U.content(), Def.sizeMid, '...')
      }));
    }
    function $toLine (C) {
      U.tr3(`[Discord:M] $toLine`);
      if (! C || ! C.tokens) { return false }
      let toID = C.tokens[ChID];
      U.tr3(`[Discord:M] $toLine - To:`, toID);
      if (! toID) { return false }
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
  }
  function IS (o) { return (TMP.is = o) }
  function DBG_MSG_WARP (msg) {
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
  }
  function UNDEBUG () {
    MSG_WARP = (msg) => { return msg };
    SEND = (func, msg, a) => {
      return func(MSG_WARP(msg)).then(P.send2callback(a));
    };
  }
  function W_BOW (wo) { U.send('おはよう！！', 20) }
  function W_CHECK (wo, h, id) {
    if (U.guildOnerID() == U.userID()) return true;
    return false;
  }
  async function memberNow () {
    if (MemberDB) return MemberDB;
    const Uid = U.userID() ||
        U.throw(`[Discord:M] memberNow: user unknown.`);
    let mD;
    await R.sysDB(`Discord`).member(Uid).then(x=> mD = x);
     mD.getRoles = getRoles;
     mD.hasGuild = hasGuild;
      mD.hasRole = hasRole;
    mD.hasExpert = hasExpert;
    mD.resetCash = resetCash;
    return (MemberDB = mD);
    //
    async function hasGuild (gid) {
      return await refreshGuild(gid || U.guildID())
      .then(x=> { return Promise.resolve(x || {}) });
    }
    async function getRoles (gid) {
      return await hasGuild(gid)
      .then(x=> { return Promise.resolve(x.roles || {}) });
    }
    async function hasRole (gid, roleID) {
      if (! roleID) U.throw(`[Discord:M] hasRole: id is unknown.`);
      return await getRoles(gid)
      .then(x=> { return Promise.resolve(x[roleID] || false) });
    }
    async function hasExpert (gid) {
      return await hasGuild(gid)
      .then(x=> { return Promise.resolve(x.imExpert ? true: false) });
    }
    function resetCash () {
      return mD.set('refreshTTL', T.unix_add(-1, 'm'));
    }
    async function refreshGuild (gid) {
      if (! gid) return { $unknown: true };
      const TTL = mD.get('refreshTTL'),
         Guilds = mD.get('guilds');
      if (! mD.hasNew() && TTL && TTL < T.unix()) {
        return { ...(Guilds[gid]), $success: true }
      }
      if (Guilds[gid]) delete Guilds[gid];
      let Mdb; await P.Client()
          .get_guild_member(gid, Uid).then(x=> Mdb = x);
      if (Mdb.id) {
        const Gm = Guilds[gid] = { roles: {}, games: {} };
        const Ex = P.ask.experts(gid) || {};
        if (Mdb.roles) {
          Mdb.roles.forEach(v=> {
            Gm.roles[v.id] = { id: v.id, name: v.name };
            let game; if (game = P.ask.extGameName(v.name)) {
              Gm.games[game] = { id: v.id, name: v.name };
            }
            if (! Gm.imExpert)
              { Gm.imExpert = Ex[v.id] ? true : false }
          });
          mD.update('guilds');
        }
      }
      mD.set('refreshTTL', T.unix_add(15, 'm'));
      return { ...(Guilds[gid]), $success: true };
    }
  }
  function $countUpMemberDB () {
    return U.memberNow().then(async box => {
      if (! box) return;
      const point = box.get('point') || 0;
      const level = box.get('level') || 0;
      U.tr4(`[Discord:M] Talk point Now: ${point} (${level})`);
      let talk; await R.brain.mkTalk()
        .Level(U.content(), level, point).then(x=> talk = x);
      U.tr3(`[Discord:M] Talk point: ${talk.point} (${talk.level})`);
      const History = box.get('pointHist') || [];
      const Now = { timeStamp: T.utc(), point: talk.is.point };
      box.set('pointHist', T.push2cut(History, Now, 50))
         .set('point', talk.point)
         .set('level', talk.level)
         .util().inc('countPost')
         .util().setDefault('tmLastPost');
      return true;
    });
  }
}
