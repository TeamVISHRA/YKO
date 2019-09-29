//
// yko/yDiscord.js
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'yDiscord.js';
const ver = `yko/${my} v190928.01`;
//
const Discord = require('discord.js');
//
let S, Y, T;
module.exports = function (y) {
  this.ver = ver;
	[S, Y, T] = [this, y, y.tool];
	S.conf = Y.conf.discord;
  S.im = Y.im.discord;
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
  S.webhook = ([id, token], str) => {
    const wh = new Discord.WebhookClient(id, token);
    return wh.send(str);
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
};
function build_component (comps) {
  Y.tr4('build_component');
  const COMPS = {};
  for (let k of comps) {
    const key = (k.match(/^yd(.+)/))[1];
	  S[key] = (a) => {
		  if (COMPS[key]) return COMPS[key];
		  const js = require('./Discord/' + k +'.js');
      COMPS[key] = new js (Y, S, a);
		  return COMPS[key];
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
	S.client = S.bot = new Discord.Client();
  S.dbGuild = new dbGuild();
  S.send2callback = send2callback;
  Y.runners(() => { S.dbGuild.refresh() });
  //
  const ON = Y.ON();
  const ENGINE = () => {
		try {
    	S.bot.on('ready', n => {
        for (let f of Y.RUNNERS()) { Y.tr5(f); f() }
        Y.tr('[[[ Connect ... Discord Client ]]]',
             '<<' + (Y.im.location || 'remote') + '>>');
        Y.tr5('Token', S.im.token);
    	});
			if (ON.discord_message)
          S.bot.on('message', baseDispatch(ON.discord_message));
      if (ON.discord_join_guild)
					S.bot.on('guildMemberAdd', ON.discord_join_guild);
			if (ON.discord_exit_guild)
					S.bot.on('guildMemberRemove', ON.discord_exit_guild);
			if (ON.discord_warn)
					S.bot.on('warn', ON.discord_warn);
			if (ON.discord_debug)
					S.bot.on('debug', ON.discord_debug);
			if (ON.discord_error)
					S.bot.on('error', ON.discord_error);
			S.bot.login(S.im.token);
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
  const MSG = S.Message();
  const botAction = Y.ON.discord_bot_action || (() => {});
	return H => {
    Y.tr5('Message handler:');
    Y.tr5(H);
		if (H.author.bot) return botAction(S, MSG, H);
    return new Promise ( resolve => {
      const is = MSG.start(H);
      if (! is || is.sleep) return resolve();
	    if (is.answer) {
        MSG.send(is.answer);
        MSG.toTwitch(MSG.nickname(), H.content).then(o => {
          if (o) {
            setTimeout(() =>
              { MSG.toTwitch('YKO', is.answer) }, 300);
          }
        })
        return resolve();
      } else {
        return resolve( func(MSG, is) );
      }
    })
    .catch (err => {
      MSG.rollback();
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
    await S.bot.guilds.forEach( async g => {
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
