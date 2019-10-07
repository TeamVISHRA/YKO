'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'yDiscord.js';
const ver = `yko/${my} v191008.01`;
//
const Discord = require('discord.js');
const AdminRoleLevel = 1920000000;
//
let STATE = 'Normal';
//
module.exports.Super = function (Y, Ref) {
  const S = this;
    S.ver = `${ver} :S`;
	 S.conf = Y.conf.discord;
     S.im = Y.im.discord;
    S.Ref = Ref;
  build_super_comp(Y, S, Y.tool);
}
module.exports.Unit = function (Y, R, Ref) {
  const U = this;
    U.ver = `${ver} :U`;
   U.root = R;
	 U.conf = Y.conf.discord;
     U.im = Y.im.discord;
    U.Ref = Ref;
  Ref.$unit   (U);
  Ref.$onFake (U);
}
module.exports.init = function (y, rd) {
  rd.$unit = isSleep(y)
      ? (u) => { u.webhook = onWebhookFake(y) }
      : (u) => { u.webhook = onWebhook(y) };
}
module.exports.onFake = function (y, rd) {
  rd.$onFake =
        (u) => { u.webhook = onWebhookFake(y) };
}
function build_super_comp (Y, S, T) {
  let CLIENT;
  S.client = () =>
    { return CLIENT || (CLIENT = new Discord.Client()) };
  S.askGuild = new askGuild(Y, S, T);
  S.onFake = () => {
    Y.tr3('onFake');
    const Fake = require('./Discord/ydFAKE.js');
    S.client = () =>
      { return CLIENT || (CLIENT = new Fake (Y, S)) };
    S.Ref.$onFake = (u) => { u.webhook = onWebhookFake(Y) };
    STATE = 'Fake';
  };
  S.init = () => { init_super(Y, S, T) };
}
function init_super (Y, S, T) {
  const ON = Y.rack.get('ON'),
   RUNNERS = Y.rack.get('RUNNERS');
  const ENGINE = () => {
		try {
      const BOT = S.client();
    	BOT.on('ready', x => {
        S.askGuild.refresh();
        for (let [key, func] of T.e(RUNNERS)) {
          Y.tr3(`'${key}' started running.`);
          func();
        }
        connectMessage(Y, S);
    	});
      let func;
			if (ON.discord_message)
        BOT.on('message', baseMessage(Y, S, T, ON));
      if (func = ON.discord_join_guild)
        BOT.on('guildMemberAdd', baseGuild(Y, S, T, func));
			if (func = ON.discord_exit_guild)
        BOT.on('guildMemberRemove', baseGuild(Y, S, T, func));
			if (ON.discord_warn)  BOT.on('warn',  ON.discord_warn);
			if (ON.discord_debug)	BOT.on('debug', ON.discord_debug);
			if (ON.discord_error)	BOT.on('error', ON.discord_error);
			BOT.login(S.im.token);
		} catch (err) {
			Y.tr('---< Warning >------------------------------');
			Y.tr(S.ver, err);
    	setTimeout(ENGINE, 10000);
		}
  };
	Y.engine(ENGINE);
  S.run = () => {
    return Y.run(()=> { return S.client() });
  };
  S.Ref.$unit = prepare_unit_comp(Y);
  if (isSleep(Y)) {
    S.Ref.$onFake = (u) => { u.webhook = onWebhookFake(Y) };
  }
  S.init = false;
}
function prepare_unit_comp (Y) {
  return (U) => {
    Y.tr3('build_unit_comp');
    let COMPS = Y.tool.c(null);
    for (let k of
    ['ydClient','ydMessage','ydGuild','ydMemberDB']) {
      const key = (k.match(/^yd(.+)/))[1];
      U[key] = () => {
        return COMPS[key] || (() => {
  	      const js = require(`./Discord/${k}.js`);
          return (COMPS[key] = new js (Y, U));
        })();
      };
    }
             U.client = () => { return Y.Discord.client() };
        U.buildDataID = (Gid) => { return `DISCORD_${Gid}` };
      U.devel_guildID = () => { return U.im.devel.guild };
    U.devel_channelID = () => { return U.im.devel.channel };
       U.devel_userID = () => { return U.im.devel.userID };
           U.askGuild = Y.Discord.askGuild;
            U.webhook = onWebhook(Y);
      U.send2callback = send2callback;
  };
}
function baseMessage (Y, S, T, ON) {
  const botAction = ON.discord_bot_action || (() => {});
	return H => {
    Y.tr7('Message handler:');
    Y.tr7(H);
		if (H.author.bot) return botAction(S, H);
    let R;
    Y.start(my).then( unitRoot => {
      R = unitRoot;
      const ydM = R.Discord.Message();
      const is = ydM.start(H);
      if (! is || is.sleep) return;
	    if (is.answer) {
        ydM.send(is.answer);
        return ydM.toTwitch('me', is.answer);
      }
      return ON.discord_message(ydM, is);
    }).catch (err => {
      let v;
      if (R) { R.rollback(); v = R.ver }
      Y.throw((v || S.ver), err);
    });
	};
}
function baseGuild (Y, S, T, func) {
  return H => {
    Y.tr7('Guild handler:');
    Y.tr7(H);
    let R;
    Y.start(my).then( unitRoot => {
      R = unitRoot;
      const ydG = R.Discord.Guild();
      ydG.start(H);
      return func(ydG);
    }).catch (err => {
      let v;
      if (R) { R.rollback(); v = R.ver }
      Y.throw((v || S.ver), err);
    });
  };
}
function send2callback (a) {
  if (! a) return () => { return true };
  if (typeof a == 'function') return a;
  return H => {
    let remove = () => {
      Y.tr3('callback (send)');
      H.delete();
    };
    setTimeout(remove, (Number(a) * 1000));
  };
}
function askGuild (Y, S, T) {
  const DB = this;
  let GUILDS;
  DB.get = async (buildID) => {
    Y.tr1('askGuild:get');
    let GD;
    await DB.cash().then( g => { GD = g[buildID] });
    return GD
  };
  DB.list = async () => {
    Y.tr1('askGuild:list');
    let GD;
    await DB.cash().then( g => { GD = g });
    return T.k(GD);
  };
  DB.cash = async () => {
    return GUILDS;
  };
  DB.refresh = async () => {
    Y.tr1('askGuild:refresh');
    let Devel = S.im.devel.guild || '';
    Y.tr2('askGuild:refresh - devel ch', Devel);
    let Guilds = {};
    await S.client().guilds.forEach( async g => {
      let GD = Guilds[g.id] = {};
      Y.tr3('askGuild:refresh - guid id', g.id);
      Y.tr5(GD);
      for (let k of ['id', 'name', 'iconURL', 'ownerID',
    		'memberCount', 'systemChannelID', 'joinedTimestamp']) {
    	     GD[k] = g[k];
      }
      GD.Devel = Devel == g.id ? true : false;
      GD.EXPERTS = {};
      GD.GAMES   = {};
      await g.roles.forEach(ro => {
			  if (ro.permissions > AdminRoleLevel) {
          Y.tr4('askGuild:refresh - role', ro.name);
				  GD.EXPERTS[ro.id] = { id: ro.id, name: ro.name,
    			  permissions: ro.permissions, color: ro.color };
        }
  	    if (ro.name.match(/^([\!-\~]+)\@play(?:er)?$/i)) {
  		    let alias = T.a2A(RegExp.$1);
          Y.tr4('askGuild:refresh - game', alias);
  		    GD.GAMES[ro.id] =
            { id: ro.id, name: ro.name, alias: alias };
  	    }
      });
      return (GUILDS = Guilds);
    });
  };
  DB.inport = (obj) => { GUILDS = obj };
}
function isSleep (y) {
  if (y.debug()) {
    STATE = 'Debug';
    if (y.im.discord.sleep) return true;
  }
  return false;
}
function onWebhook (y) {
  return async ([id, token], str) => {
    const wh = new Discord.WebhookClient(id, token);
    return wh.send(str);
  };
}
function onWebhookFake (y) {
  return async (token, str) => {
    return y.tr('webhook', token, str);
  };
}
function connectMessage (Y, S) {
  Y.tr(`[[[ Connect ... Discord Client (${STATE}) ]]]`);
  Y.tr7('Token', S.im.token);
}
