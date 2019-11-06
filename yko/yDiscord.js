'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'yDiscord.js';
const ver = `yko/${my} v191105`;
//
const Discord = require('discord.js');
const ydFake  = './Discord/ydFAKE.js';
const AdminRoleLevel = 1920000000;
//
let STATE = 'Normal';
//
function connectMessage (S) {
  S.un.tr(`[Discord] Client Connected !! (${STATE})`);
  S.un.tr7('[Discord] Token', S.conf.token);
}
module.exports.Super = function (Y, Ref) {
  const S = Y.superKit('discord', this, Y, Ref);
  S.ver = `${ver} :S`;
  S.DebugCall = DebugCall(S);
  build_super_comp(S, Y.tool);
}
module.exports.Unit = function (R, Ref) {
  const U = R.unitKit('discord', this, R, Ref);
  U.ver = `${ver} :U`;
  Ref.$unit   (U);
  Ref.$onFake (U);
}
module.exports.init = function (Y, Ref) {
  Y.tr4('[Discord] init');
  Ref.$unit = isSleep(Y) ? (u) => {
    u.webhook = onWebhookFake(Y);
    u.see = (...arg) => { return see(u, ...arg) };
  }: (u) => {
    u.webhook = onWebhook(Y);
    u.see = (...arg) => { return see(u, ...arg) };
  };
  Ref.$onFake = () => {};
}
module.exports.initFake = function (Y, Ref) {
  Y.tr4('[Discord] OK !! initFake.');
  Ref.$onFake =
        (u) => { u.webhook = onWebhookFake(Y) };
}
function build_super_comp (S) {
  const T = S.tool;
  S.tr4('[Discord] build_super_comps');
  let CLIENT;
  S.client = () =>
    { return CLIENT || (CLIENT = new Discord.Client()) };
  S.ask = new askGuild(S, T);
  S.onFake = () => {
    S.tr3('[Discord] onFake');
    const Fake = require(ydFake);
    S.client = () =>
         { return CLIENT || (CLIENT = new Fake.on (S)) };
    S.Ref.$onFake = (u) => { u.webhook = onWebhookFake(S.un) };
    STATE = 'Fake';
  };
  S.init = () => { init_super(S, T) };
}
function init_super (S, T) {
  S.tr4('[Discord] init_super');
  const ON = S.rack.get('ON');
  let CLIENT;
  S.connect = () => {
    return new Promise ( resolve => {
      if (CLIENT) return resolve(CLIENT);
      const Bot = S.client();
      Bot.on('ready', async x => {
        S.ask.refresh(Bot);
        for (let [key, func] of T.e(S.runners())) {
          S.tr3(`[Discord] '${key}' started running.`);
          func()
          .then(x=> S.tr3(`[Discord:ready...] run:`, key))
          .catch(e=> S.throw(`[Discord:ready]`, e));
        }
        connectMessage(S);
        return resolve(CLIENT = Bot);
      });
      let func;
      if (ON.discord_message)
        Bot.on('message', baseMessage(S, T, ON));
      if (func = ON.discord_join_guild)
        Bot.on('guildMemberAdd', baseGuild(S, T, func));
      if (func = ON.discord_exit_guild)
        Bot.on('guildMemberRemove', baseGuild(S, T, func));
      if (ON.discord_warn)  Bot.on('warn',  ON.discord_warn);
      if (ON.discord_debug) Bot.on('debug', ON.discord_debug);
      if (ON.discord_error) Bot.on('error', ON.discord_error);
      Bot.login(S.conf.token);
    });
  };
  const ENGINE = () => {
    try {
      return S.connect();
    } catch (err) {
      S.tr('[Discord] Warning -------------------');
      S.tr(S.ver, err);
      setTimeout(ENGINE, 10000);
    }
  };
  S.un.engine(ENGINE);
  S.run = S.un.run;
  S.Ref.$unit = prepare_unit_comp(S);
  if (isSleep(S)) S.onFake();
  S.init = false;
}
function prepare_unit_comp (S) {
  S.tr4('[Discord] prepare_unit_comp');
  return (U) => {
    S.tr5('[Discord] build_unit_comp');
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
    const Dv = U.conf.devel;
             U.client = () => { return U.super.connect() };
              U.sdKey = (Gid) => { return `Discord.${Gid}` };
      U.devel_guildID = () => { return Dv.guild    };
    U.devel_channelID = () => { return Dv.channel  };
       U.devel_userID = () => { return Dv.userID   };
  U.devel_webhookCode = () => { return Dv.webhook  };
                U.ask = U.super.ask;
            U.webhook = onWebhook(U.un);
    U.send2callback =
            (...arg) => { return send2callback(U, ...arg) };
    U.see = (...arg) => { return see(U, ...arg) };
    U.tmpl = (Gid, tmpl, attr) =>
        { return TMPL(U, Gid, tmpl, attr) };
  };
}
function baseMessage (S, T, ON) {
  S.tr4('[Discord] baseMessage');
  const botAction = ON.discord_bot_action || (() => {});
  return H => {
    S.tr7('[Discord] Message handler:');
    S.tr7(H);
    if (H.author.bot) return botAction(S, H);
    let R;
    S.start(my).then( unitRoot => {
      R = unitRoot;
      return R.Discord.Message().start(H);
    }).then( ydM => {
      const is = ydM.is();
      if (is.sleep) return ydM.finish();
      if (is.answer) {
        ydM.send(is.answer);
        return ydM.toTwitch(is.answer).then(x=> ydM.finish());
      }
      if (! is.post) return ydM.finish();
      return ON.discord_message(ydM, is);
    }).catch (err => {
      let v;
      if (R) { R.rollback(); v = R.ver }
      S.throw((v || S.ver), err);
    });
	};
}
function baseGuild (S, T, func) {
  S.tr4('[Discord] baseGuild');
  return H => {
    S.tr7('[Discord] Guild handler:');
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
      U.tr3('[Discord] callback (send)');
      H.delete();
    };
    setTimeout(remove, (Number(a) * 1000));
  };
}
function askGuild (S, T) {
  const DB = this;
  let GUILDS;
  //
  DB.ref = () => {
    return GUILDS;
  };
  DB.guilds = () => {
    S.tr1('[Discord] askGuild:list');
    return GUILDS ? T.k(GUILDS): [];
  };
  DB.get = (GuildID) => {
    S.tr1('[Discord] ask:get');
    return (GUILDS && GUILDS[GuildID]) ? GUILDS[GuildID]: false; 
  };
  DB.games = (GuildID) => {
    const gm = DB.get(GuildID);
    return gm ? gm.GAMES: false;
  };
  DB.gameAlias = (GuildID) => {
    const gm = DB.get(GuildID);
    return gm ? gm.GAMES.map(o=> o.alias ): false;
  };
  DB.experts = (GuildID) => {
    const gm = DB.get(GuildID);
    return gm ? gm.EXPERTS : false;
  };
  DB.refresh = async (Clt) => {
    S.tr1('[Discord] ask:refresh');
    let Devel = S.conf.devel.guild || '';
    S.tr2('[Discord] ask:refresh - devel ch', Devel);
    let Guilds = T.c(null);
    if (! Clt) await S.connect().then(c=> Clt = c );
    Clt.guilds.forEach( async g => {
      let GD = Guilds[g.id] = T.c(null);
      S.tr3('[Discord] ask:refresh - guild id', g.id);
      S.tr5(GD);
      for (let k of ['id', 'name', 'iconURL', 'ownerID',
        'memberCount', 'systemChannelID', 'joinedTimestamp']) {
        GD[k] = g[k];
      }
      GD.Devel = Devel == g.id ? true : false;
      GD.EXPERTS = T.c(null);
      GD.GAMES   = T.c(null);
      g.roles.forEach(ro => {
        const nm = ro.name;
        if (ro.permissions > AdminRoleLevel) {
          S.tr4('[Discord] ask:refresh - role', nm);
          GD.EXPERTS[ro.id] = { id: ro.id, name: nm,
            permissions: ro.permissions, color: ro.color };
        }
        if (   /^([^\@]+)\@game$/i.exec(nm)
            || /^([^\@]+)\@play(?:er)?$/i.exec(nm)
            || /^game[\_\-\=\:](.+)$/i.exec(nm) ) {
          let alias = T.a2A(RegExp.$1);
          S.tr4('[Discord] ask:refresh - game', alias);
          GD.GAMES[ro.id] =
            { id: ro.id, name: nm, alias: alias };
        }
      });
      return (GUILDS = Guilds);
    });
  };
}
function isSleep (X) {
  if (X.debug()) {
    STATE = 'Debug';
    if (X.un.conf.discord.sleep) {
      X.tr3('[Discord] im Sleep !!');
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
    return Y.tr('[Discord] webhook', token, str);
  };
}
function DebugCall (S) {
  return () => {
    if (! S.ARGV) return S;
    const Fake = require(ydFake);
    return Fake.call(S);
  };
}
const psTry = (str) => {
  return /^([A-Z][A-Za-z0-9_]+)\s*\(\s*([^\(\)]+)\s*\)/.exec(str)
    ? [RegExp.$1, RegExp.$2]: false;
};
const psKey = (str) => {
  return /([^\s\.]+)\.([^\s]+)/.exec(str)
    ? [RegExp.$1, RegExp.$2]: false;
};
const psNA = '... (Discord:N/A) ...';
function see (U, fr) {
  return new Promise ( async resolve => {
    let Name, Key;
    if ([Name, Key] = psTry(fr)) {
      U.tr3(`[Discord] see`, Name, Key);
      if ('WH' == Name) {
        let Gid; [Gid, Key] = psKey(Key);
        let Val;
        await U.root.sysDB(`Discord.${Gid}`)
               .cash('webhooks').then(v=> Val = v);
        return resolve(Val[Key] || psNA);
      }
    }
    return resolve(psNA);
  });
}
function TMPL (U, Gid, tmpl, at) {
  return new Promise (resolve => {
    const C = U.Client(),
          A = U.ask.get(Gid);
    const Funcs = {
    guildName: () => { return A.name },
      botName: () => { return U.conf.username },
    sysCHname: () =>
      { return C.get_channel(A.systemChannelID).name },
      chAgree: () =>
      { return C.get_channel(at.agree).name || '(N/A)' }
    };
    const result = U.tool.tmpl(tmpl, (x_, key) => {
      key = key.trim();
      let arg;
      if (/([a-zA-Z0-9_]+)\s*\(\s*([^\(\)]+)\s*\)/.exec(key))
        { [key, arg] = [RegExp.$1, RegExp.$2] }
      if (Funcs[key]) {
        arg = arg ? arg.split(/\s*\,\s*/) : [];
        return Funcs[key](...arg);
      }
      return x_;
    });
    return resolve(result);
  });
}
