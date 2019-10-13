'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'yDiscord.js';
const ver = `yko/${my} v191013.01`;
//
const Discord = require('discord.js');
const ydFake  = './Discord/ydFAKE.js';
const AdminRoleLevel = 1920000000;
//  w
let STATE = 'Normal';
module.exports.Super = function (Y, Ref) {
  const S = Y.superKit('discord', this, 0, 0, Ref);
  S.ver = `${ver} :S`;
  S.DebugCall = DebugCall(S);
  build_super_comp(S, Y.tool);
}
module.exports.Unit = function (R, Ref) {
  const U = R.unitKit('discord', this, 0, 0, Ref);
  U.ver = `${ver} :U`;
  U.super = R.un.Discord;
  Ref.$unit   (U);
  Ref.$onFake (U);
}
module.exports.init = function (Y, Ref) {
  Y.tr4('yDiscord:init');
  Ref.$unit = isSleep(Y)
      ? (u) => { u.webhook = onWebhookFake(Y) }
      : (u) => { u.webhook = onWebhook(Y) };
  Ref.$onFake = () => {};
}
module.exports.onFake = function (Y, Ref) {
  Y.tr4('yDiscord:onFake');
  Ref.$onFake =
        (u) => { u.webhook = onWebhookFake(Y) };
}
function build_super_comp (S) {
  const T = S.tool;
  S.tr4('build_super_comps');
  let CLIENT;
  S.client = () =>
    { return CLIENT || (CLIENT = new Discord.Client()) };
  S.ask = new askGuild(S, T);
  S.onFake = () => {
    S.tr3('onFake');
    const Fake = require(ydFake);
    S.client = () =>
         { return CLIENT || (CLIENT = new Fake.on (S)) };
    S.Ref.$onFake = (u) => { u.webhook = onWebhookFake(S.un) };
    STATE = 'Fake';
  };
  S.init = () => { init_super(S, T) };
}
function init_super (S, T) {
  S.tr4('init_super');
  const ON = S.rack.get('ON'),
   RUNNERS = S.rack.get('RUNNERS');
  const ENGINE = () => {
    try {
      const BOT = S.client();
      BOT.on('ready', x => {
        S.ask.refresh();
        for (let [key, func] of T.e(RUNNERS)) {
          S.tr3(`'${key}' started running.`);
          func();
        }
        connectMessage(S);
      });
      let func;
      if (ON.discord_message)
        BOT.on('message', baseMessage(S, T, ON));
      if (func = ON.discord_join_guild)
        BOT.on('guildMemberAdd', baseGuild(S, T, func));
      if (func = ON.discord_exit_guild)
        BOT.on('guildMemberRemove', baseGuild(S, T, func));
      if (ON.discord_warn)  BOT.on('warn',  ON.discord_warn);
      if (ON.discord_debug)	BOT.on('debug', ON.discord_debug);
      if (ON.discord_error)	BOT.on('error', ON.discord_error);
      BOT.login(S.im.token);
    } catch (err) {
      S.tr('---< Warning >------------------------------');
      S.tr(S.ver, err);
      setTimeout(ENGINE, 10000);
    }
    return S.client();
  };
  S.un.engine(ENGINE);
  S.run = S.un.run;
  S.Ref.$unit = prepare_unit_comp(S);
  if (isSleep(S)) S.onFake();
  S.init = false;
}
function prepare_unit_comp (S) {
  S.tr4('prepare_unit_comp');
  return (U) => {
    S.tr3('build_unit_comp');
    let COMPS = S.tool.c(null);
    for (let k of
    ['ydClient','ydMessage','ydGuild','ydMemberDB']) {
      const key = (k.match(/^yd(.+)/))[1];
      U[key] = () => {
        return COMPS[key] || (() => {
          const js = require(`./Discord/${k}.js`);
          return (COMPS[key] = new js.Unit (U));
        })();
      };
    }
             U.client = () => { return U.super.client()    };
        U.buildDataID = (Gid) => { return `DISCORD_${Gid}` };
      U.devel_guildID = () => { return U.im.devel.guild    };
    U.devel_channelID = () => { return U.im.devel.channel  };
       U.devel_userID = () => { return U.im.devel.userID   };
                U.ask = S.un.Discord.ask;
            U.webhook = onWebhook(U.un);
      U.send2callback =
           (...args) => { return send2callback(U, ...args) };
  };
}
function baseMessage (S, T, ON) {
  S.tr4('baseMessage');
  const botAction = ON.discord_bot_action || (() => {});
  return H => {
    S.tr7('Message handler:');
    S.tr7(H);
    if (H.author.bot) return botAction(S, H);
    let R;
    S.start(my).then( unitRoot => {
      R = unitRoot;
      return R.Discord.Message().start(H);
    }).then( ydM => {
      const is = R.brain.result();
      if (is.sleep) return R.finish();
      if (is.answer) {
        ydM.send(is.answer);
        ydM.toTwitch(is.answer);
        return R.finish();
      }
      if (! is.post) return R.finish();
      return ON.discord_message(ydM, is);
    }).catch (err => {
      let v;
      if (R) { R.rollback(); v = R.ver }
      S.throw((v || S.ver), err);
    });
	};
}
function baseGuild (S, T, func) {
  S.tr4('baseGuild');
  return H => {
    S.tr7('Guild handler:');
    S.tr7(H);
    let R;
    S.un.start(my).then( unitRoot => {
      R = unitRoot;
      return R.Discord.Guild().start(H);
    }).then( ydG => {
      return func(ydG);
    }).catch (err => {
      let v;
      if (R) { R.rollback(); v = R.ver }
      S.throw((v || S.ver), err);
    });
  };
}
function send2callback (U, a) {
  if (! a) return () => { return true };
  if (typeof a == 'function') return a;
  return H => {
    let remove = () => {
      U.tr3('callback (send)');
      H.delete();
    };
    setTimeout(remove, (Number(a) * 1000));
  };
}
function askGuild (S, T) {
  const DB = this;
  let GUILDS;
  //
  DB.get = (GuildID) => {
    S.tr1('ask:get');
    return (GUILDS && GUILDS[GuildID]) ? GUILDS[GuildID]: false; 
  };
  DB.list = () => {
    S.tr1('askGuild:list');
    return GUILDS ? T.k(GUILDS): [];
  };
  DB.cash = () => {
    return GUILDS;
  };
  DB.games = (GuildID) => {
    const gm = DB.get(GuildID);
    if (! gm) return false;
    return gm.GAMES;
  };
  DB.gameAlias = (GuildID) => {
    const gm = DB.get(GuildID);
    if (! gm) return false;
    return gm.GAMES.map(o=> o.alias );
  };
  DB.experts = (GuildID) => {
    const gm = DB.get(GuildID);
    if (! gm) return false;
    return gm.EXPERTS;
  };
  DB.refresh = async () => {
    S.tr1('ask:refresh');
    let Devel = S.im.devel.guild || '';
    S.tr2('ask:refresh - devel ch', Devel);
    let Guilds = {};
    await S.client().guilds.forEach( async g => {
      let GD = Guilds[g.id] = T.c(null);
      S.tr3('ask:refresh - guid id', g.id);
      S.tr5(GD);
      for (let k of ['id', 'name', 'iconURL', 'ownerID',
        'memberCount', 'systemChannelID', 'joinedTimestamp']) {
        GD[k] = g[k];
      }
      GD.Devel = Devel == g.id ? true : false;
      GD.EXPERTS = {};
      GD.GAMES   = {};
      await g.roles.forEach(ro => {
        const nm = ro.name;
        if (ro.permissions > AdminRoleLevel) {
          S.un.tr4('askGuild:refresh - role', nm);
          GD.EXPERTS[ro.id] = { id: ro.id, name: nm,
            permissions: ro.permissions, color: ro.color };
        }
        if ( nm.match(/^([^\@]+)\@game$/i)
          || nm.match(/^([^\@]+)\@play(?:er)?$/i)
          || nm.match(/^game[\_\-\=\:](.+)$/i)
        ) {
          let alias = T.a2A(RegExp.$1);
          S.tr4('ask:refresh - game', alias);
          GD.GAMES[ro.id] =
            { id: ro.id, name: nm, alias: alias };
        }
      });
      return (GUILDS = Guilds);
    });
  };
}
function isSleep (Y) {
  if (Y.debug()) {
    STATE = 'Debug';
    if (Y.un.im.discord.sleep) {
      Y.tr3('[Discord] im Sleep !!');
      return true;
    }
  }
  return false;
}
function onWebhook () {
  return async ([id, token], str) => {
    const wh = new Discord.WebhookClient(id, token);
    return wh.send(str);
  };
}
function onWebhookFake (Y) {
  return async (token, str) => {
    return Y.tr('webhook', token, str);
  };
}
function connectMessage (S) {
  S.un.tr(`[Connect] Discord Client (${STATE})`);
  S.un.tr7('Token', S.im.token);
}
function DebugCall (S) {
  return () => {
    const [,, ...ARGV] = process.argv;
    if (ARGV.length < 1) return S;
    const Fake = require(ydFake);
    return Fake.call(S, ARGV);
  };
}
