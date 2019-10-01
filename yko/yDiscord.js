//
// yko/yDiscord.js
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'yDiscord.js';
const ver = `yko/${my} v190930.01`;
//
const Discord = require('discord.js');
//
let S, Y, T;
module.exports = function (y) {
  this.ver = ver;
	[S, Y, T] = [this, y, y.tool];
	S.conf = Y.conf.discord;
  S.im   = Y.im.discord;
	S.init = () => {
    Y.tr4('init');
    build_component([
      'ydClient',
      'ydMessage',
      'ydGuild',
      'ydMemberDB',
      'ydTester'
    ]);
  };
  S.devel_guildID = () => {
    Y.tr2('devel_guildID : '   + S.im.devel.guild );
    return S.im.devel.guild;
  };
  S.devel_channelID = () => {
    Y.tr2('devel_channelID : ' + S.im.devel.channel );
    return S.im.devel.channel;
  };
  S.devel_userID = () => {
    Y.tr2('devel_userID : '    + S.im.devel.userID );
    return S.im.devel.userID;
  };
  let CLIENT;
  S.client = () => {
    return CLIENT || (CLIENT = new Discord.Client());
  };
  S.webhook = ([id, token], str) => {
    const wh = new Discord.WebhookClient(id, token);
    return wh.send(str);
  };
  S.preparFake = () => {
    Y.tr3('preparFake');
    const Fake= require('./Discord/ydFAKE.js');
    S.webhook = (token, str) => { Y.tr('webhook', token, str) };
    S.client = () => {
      return CLIENT || (CLIENT = new Fake (Y, S));
    };
  };
};
function build_component (comps) {
  Y.tr4('build_component');
  const COMPS = {};
  for (let k of comps) {
    const key = (k.match(/^yd(.+)/))[1];
	  S[key] = () => {
      return COMPS[key] || (() => {
		    const js = require('./Discord/' + k +'.js');
        return (COMPS[key] = new js (Y, S));
      })();
	  };
  }
  if (Y.REQ1() == 'Discord') {
    build_engine();
  } else {
  }
}
function build_engine () {
  Y.tr4('build_engine');
  S.buildDataID = (guild) => { return `_YKO_DISCORD_${guild}_` };
  S._export_build_engine_ = () => { return build_engine };
  S.dbGuild = new dbGuild();
  S.send2callback = send2callback;
  Y.runners(() => { S.dbGuild.refresh() });
  //
  const ON = Y.ON();
  const ENGINE = () => {
		try {
      const BOT = S.client();
    	BOT.on('ready', x => {
        for (let f of Y.RUNNERS()) { Y.tr5(f); f() }
        Y.tr('[[[ Connect ... Discord Client ]]]',
             '<<' + (Y.im.location || 'remote') + '>>');
        Y.tr7('Token', S.im.token);
    	});
			if (ON.discord_message)
          BOT.on('message', baseDispatch(ON.discord_message));
      if (ON.discord_join_guild)
					BOT.on('guildMemberAdd', ON.discord_join_guild);
			if (ON.discord_exit_guild)
					BOT.on('guildMemberRemove', ON.discord_exit_guild);
			if (ON.discord_warn)
					BOT.on('warn', ON.discord_warn);
			if (ON.discord_debug)
					BOT.on('debug', ON.discord_debug);
			if (ON.discord_error)
					BOT.on('error', ON.discord_error);
			BOT.login(S.im.token);
		} catch (err) {
			Y.rollback();
			Y.tr('---< Warning >------------------------------');
			Y.tr(err);
    	setTimeout(ENGINE, 10000);
		}
  };
	Y.engine(ENGINE);
  S.run = Y.run;
}
function baseDispatch (func) {
  const botAction = Y.ON.discord_bot_action || (() => {});
	return H => {
    Y.tr7('Message handler:');
    Y.tr7(H);
		if (H.author.bot) return botAction(S, H);
    let Xm;
    Y.start().then( X => {
      Xm = X.Discord.Message();
      const is = Xm.start(H);
      if (! is || is.sleep) return;
	    if (is.answer) {
        Xm.send(is.answer);
        S.Message().toTwitch(Xm, Xm.nickname(), H.content)
        return resolve();
      } else {
        return resolve( func(Xm, is) );
      }
    }).catch (err => {
      if (Xm) Xm.rollback();
      Y.throw(ver, err);
    });
	};
}
function send2callback (a) {
  if (! a) return () => { return true };
  if (typeof a == 'function') return a;
  return (h) => {
    let remove = () => {
      Y.tr3('callback (send)');
      h.delete();
    };
    setTimeout(remove, (Number(a) * 1000));
  };
}
function dbGuild () {
  const DB = this;
  const AdminRoleLevel = 1920000000;
  let GUILDS = {};
  DB.get = async (buildID) => {
    Y.tr1('dbGuild:get');
    let GD;
    await DB.cash().then( g => { GD = g[buildID] });
    return GD
  };
  DB.list = async () => {
    Y.tr1('dbGuild:list');
    let GD;
    await DB.cash().then( g => { GD = g });
    return Object.keys(GD);
  };
  let refreshInterval = T.unix_add(10, 'm');
  DB.cash = async () => {
    Y.tr1('dbGuild:cash');
    if (GUILDS && refreshInterval < T.unix()) return GUILDS;
    await DB.refresh()
      .then(x=> { refreshInterval = T.unix_add(10, 'm') });
    return GUILDS;
  };
  DB.refresh = async () => {
    Y.tr1('dbGuild:refresh');
    let Devel = S.im.devel.guild || '';
    Y.tr2('dbGuild:refresh - devel ch', Devel);
    let Guilds = {};
    await S.client().guilds.forEach( async g => {
      let GD = Guilds[g.id] = {};
      Y.tr3('dbGuild:refresh - guid id', g.id);
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
          Y.tr4('dbGuild:refresh - role', ro.name);
				  GD.EXPERTS[ro.id] = { id: ro.id, name: ro.name,
    			  permissions: ro.permissions, color: ro.color };
        }
  	    if (ro.name.match(/^([\!-\~]+)\@player$/i)) {
  		    let alias = Y.tool.a2A(RegExp.$1);
          Y.tr4('dbGuild:refresh - game', alias);
  		    GD.GAMES[ro.id] =
            { id: ro.id, name: ro.name, alias: alias };
  	    }
      });
      return (GUILDS = Guilds);
    });
  };
  DB.inport = (obj) => { GUILDS = obj };
}
