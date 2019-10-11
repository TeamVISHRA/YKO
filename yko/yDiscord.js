'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'yDiscord.js';
const ver = `yko/${my} v191010.01`;
//
const Discord = require('discord.js');
const ydFake  = './Discord/ydFAKE.js';
const AdminRoleLevel = 1920000000;
//  w
let STATE = 'Normal';
module.exports.Super = function (Y, Ref) {
      const S = this;
        S.ver = `${ver} :S`;
	     S.conf = Y.conf.discord;
         S.im = Y.im.discord;
        S.Ref = Ref;
  S.DebugCall = DebugCall(Y, S);
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
function build_super_comp (Y, S, T) {
  Y.tr4('build_super_comps');
  let CLIENT;
  S.client = () =>
    { return CLIENT || (CLIENT = new Discord.Client()) };
  S.ask = new askGuild(Y, S, T);
  S.onFake = () => {
    Y.tr3('onFake');
    const Fake = require(ydFake);
    S.client = () =>
         { return CLIENT || (CLIENT = new Fake.on (Y, S)) };
    S.Ref.$onFake = (u) => { u.webhook = onWebhookFake(Y) };
    STATE = 'Fake';
  };
  S.init = () => { init_super(Y, S, T) };
}
function init_super (Y, S, T) {
  Y.tr4('init_super');
  const ON = Y.rack.get('ON'),
   RUNNERS = Y.rack.get('RUNNERS');
  const ENGINE = () => {
		try {
      const BOT = S.client();
    	BOT.on('ready', x => {
        S.ask.refresh();
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
    return S.client();
  };
	Y.engine(ENGINE);
  S.run = Y.run;
  S.Ref.$unit = prepare_unit_comp(Y);
  if (isSleep(Y)) S.onFake();
  S.init = false;
}
function prepare_unit_comp (Y) {
  Y.tr4('prepare_unit_comp');
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
             U.client = () => { return Y.Discord.client()  };
        U.buildDataID = (Gid) => { return `DISCORD_${Gid}` };
      U.devel_guildID = () => { return U.im.devel.guild    };
    U.devel_channelID = () => { return U.im.devel.channel  };
       U.devel_userID = () => { return U.im.devel.userID   };
           U.askGuild = Y.Discord.askGuild;
            U.webhook = onWebhook(Y);
      U.send2callback =
          (...args) => { return send2callback(Y, ...args) };
  };
}
function baseMessage (Y, S, T, ON) {
  Y.tr4('baseMessage');
  const botAction = ON.discord_bot_action || (() => {});
	return H => {
    Y.tr7('Message handler:');
    Y.tr7(H);
		if (H.author.bot) return botAction(S, H);
    let R;
    Y.start(my).then( unitRoot => {
      R = unitRoot;
      return R.Discord.Message().start(H);
    }).then( ydM => {
      const is = R.brain.result();
      if (is.sleep) return R.finish();
	    if (is.answer) {
        ydM.send(is.answer);
        ydM.toTwitch('me', is.answer);
        return R.finish();
      }
      if (! is.post) return R.finish();
      return ON.discord_message(ydM, is);
    }).catch (err => {
      let v;
      if (R) { R.rollback(); v = R.ver }
      Y.throw((v || S.ver), err);
    });
	};
}
function baseGuild (Y, S, T, func) {
  Y.tr4('baseGuild');
  return H => {
    Y.tr7('Guild handler:');
    Y.tr7(H);
    let R;
    Y.start(my).then( unitRoot => {
      R = unitRoot;
      return R.Discord.Guild().start(H);
    }).then( ydG => {
      return func(ydG);
    }).catch (err => {
      let v;
      if (R) { R.rollback(); v = R.ver }
      Y.throw((v || S.ver), err);
    });
  };
}
function send2callback (Y, a) {
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
  //
  DB.get = (GuildID) => {
    Y.tr1('ask:get');
    return (GUILDS && GUILDS[GuildID]) ? GUILDS[GuildID]: false; 
  };
  DB.list = () => {
    Y.tr1('askGuild:list');
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
    Y.tr1('ask:refresh');
    let Devel = S.im.devel.guild || '';
    Y.tr2('ask:refresh - devel ch', Devel);
    let Guilds = {};
    await S.client().guilds.forEach( async g => {
      let GD = Guilds[g.id] = T.c(null);
      Y.tr3('ask:refresh - guid id', g.id);
      Y.tr5(GD);
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
          Y.tr4('askGuild:refresh - role', nm);
				  GD.EXPERTS[ro.id] = { id: ro.id, name: nm,
    			  permissions: ro.permissions, color: ro.color };
        }
  	    if ( nm.match(/^([^\@]+)\@game$/i)
          || nm.match(/^([^\@]+)\@play(?:er)?$/i)
          || nm.match(/^game[\_\-\=\:](.+)$/i)
        ) {
  		    let alias = T.a2A(RegExp.$1);
          Y.tr4('ask:refresh - game', alias);
          GD.GAMES[ro.id] =
            { id: ro.id, name: nm, alias: alias };
  	    }
      });
      return (GUILDS = Guilds);
    });
  };
//  DB.inport = (obj) => { GUILDS = obj };
}
function isSleep (y) {
  if (y.debug()) {
    STATE = 'Debug';
    if (y.im.discord.sleep) {
      y.tr3('[Discord] im Sleep !!');
      return true;
    }
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
  Y.tr(`[Connect] Discord Client (${STATE})`);
  Y.tr7('Token', S.im.token);
}
function DebugCall (Y, S) {
  return () => {
    const [,, ...ARGV] = process.argv;
    if (ARGV.length < 1) return S;
    const Fake = require(ydFake);
    return Fake.call(Y, S, ARGV);
  };
}
