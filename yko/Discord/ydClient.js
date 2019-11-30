'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ydClient.js';
const ver = `yko/Discord/${my} v191130`;
//
module.exports.Unit = function (P) {
   const R = P.root;
   const S = R.unitKit(my, this, P);
     S.ver = ver;
	 const T = S.tool, B = async (func) => {
    let clt;
    await P.super.connect().then(x=> clt = x);
    return func(clt);
  };
  const Ca = {
    USR: T.c(null),
    CHL: T.c(null),
    GMM: T.c(null)
  };
	S.get_user = (id) => {
    return B( Clt => {
  		if (! id) S.throw(`[Discord:C] Unknown 'user id'.`);
      S.tr3('[Discord:C] get_user', id);
  		if (Ca.USR[id]) return Ca.USR[id];
      let o; if (o = Clt.users.get(id)) {
        return (Ca.USR[id] = o);
      }
      S.tr3(`[Discord:C] Warning: get_user: Unknown '${id}'.`);
      return (Ca.USR[id] = {});
    });
		// { bot, id, username, avatarURL,
		//   discriminator, lastMessageID, lastMessage }
		// --- <user>.send()
	};
  S.get_guilds = () => {
    return B( Clt => { return Clt.guilds });
  };
	S.get_guild = (id) => {
    return B( Clt => {
  		if (! id) S.throw(`[Discord:C] Unknown 'guild id'.`);
      S.tr2('[Discord:C] get_guild', id);
  		return Clt.guilds.get(id) || false;
    });
  	// { id, name, iconURL, region, memberCount, systemChannelID,
		//   joinedTimestamp, ownerID, members, channels, roles }
  	// --- <members>.get(id)
		// --- <channels>.get(id)
		// --- <roles>.get(id)
	};
	S.get_channel = (id) => {
    return B( Clt => {
  		if (! id) Y.throw(`[Discord:C] Unknown 'channel id'.`);
      S.tr3('[Discord:C] get_channel', id);
      if (Ca.CHL[id]) return Ca.CHL[id];
      let o;
      if (Clt.channels) {
        if (o = Clt.channels.get(id))
            return (Ca.CHL[id] = o);
      }
      if (Clt.guild && B.guild.channels) {
        if (o = Clt.guild.channels.get(id))
            return (Ca.CHL[id] = o);
      }
      S.tr3(`[Discord:C] Warning: get_channel: Unknown '${id}'.`);
      return (Ca.CHL[id] = {});
  	});
    // { type, id, name, parentID, topic, lastMessageID,
		//   lastPinTimestamp, guild { members, channels, roles, ... },
		// --- <channel>.send()
	};
	S.get_guild_member = async (gid, mid) => {
		if (! gid) S.throw(`[Discord:C] Unknown 'guild id'.`);
		if (! mid) S.throw(`[Discord:C] Unknown 'member id'.`);
    S.tr3('[Discord:C] get_guild_member', `[${gid}] [${mid}]`);
    const Key = `${gid}.${mid}`;
    return Ca.GMM[Key] || (async () => {
      let Clt; await S.get_guild(gid).then(x=> Clt = x );
      let o; if (Clt.id && (o = Clt.members.get(mid))) {
        return (Ca.GMM[Key] = o); 
      }
      S.tr3(`[Discord:C]`
          + `Warning: get_guild_member: Unknown '${mid}'.`);
      return (Ca.GMM[Key] = {});
    }) ();
		// nickname, joinedTimestamp, _roles [],
		// user { bot, id, username, avatarURL, discriminator }
		// guild { members, channels, roles, ... }
		// --- <member>.send()
	};
  let SEND, SYSTEMCHID;
  if (S.debug() && R.conf.debug_level && R.conf.debug_level > 1) {
    const Dv = P.conf.devel;
    const send = SEND;
    SEND = (ch, msg, a) => {
      S.tr4(`[Discord:C] SEND: ${Dv.channel}`, msg,
            `[DBG:${ch.id}]>>> ${Dv.channel}`);
      S.get_channel(Dv.channel).then(Ch => {
        if (Ch.id) {
          return Ch.send(msg).then(P.send2callback(a));
        }
        S.tr(`[Discord:C] !! WARNING !! `
           + `'${Dv.channel}' is unknown channel.`);
        return Promise.resolve(false);
      });
    };
    SYSTEMCHID = async () => {
      S.tr3('[Discord:C] systemChannelID - debug', Dv.channel);
      return Dv.channel;
    };
  } else {
    SEND = (Ch, msg, a) => {
      S.tr3('[Discord:C] SEND', msg);
      S.tr7('[Discord:C] ', Ch.id);
		  return Ch.send(msg).then(P.send2callback(a));
    };
    SYSTEMCHID = async (gid) => {
      S.tr3('[Discord:C] systemChannelID - Call');
      let guild; await S.get_guild(gid).then(cls => {
        guild = cls || S.throw(`[Discord:C] Not found: ${gid}`);
      });
      const sysCH = guild.systemChannelID || false;
      S.tr3('[Discord:C] systemChannelID', `(${sysCH}) remote ??`);
		  return sysCH;
    };
  }
	S.systemChannelID = SYSTEMCHID;
	S.systemCH_send = (gid, msg, a) => {
    S.tr3('[Discord:C] systemCH_send', gid);
    return S.systemChannelID(gid)
        .then(sID => { return S.channel_send(sID, msg, a) });
	};
	S.channel_send = (id, msg, a) => {
    S.tr3('[Discord:C] channel_send', id);
		return S.get_channel(id)
        .then(cID => { return SEND(cID, msg, a) });
	};
	S.DMsend = (id, msg, a) => {
    S.tr3('[Discord:C] DMsend', id);
    return S.get_user(id)
        .then(uID => { return SEND(uID, msg, a) });
	};
}
