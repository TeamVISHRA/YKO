'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ydClient.js';
const ver = `yko/Discord/${my} v191013.01`;
//
module.exports.Unit = function (P) {
   const R = P.root;
   const S = R.unitKit(my, this, P.im, P.conf);
     S.ver = ver;
  S.parent = P;
	 const B = P.client();
	S.get_user = (id) => {
		if (! id) S.throw(ver, "Unknown 'user id'");
    S.tr2('get_user', id);
		return (B.users.get(id) || false);
		// { bot, id, username, avatarURL,
		//   discriminator, lastMessageID, lastMessage }
		// --- <user>.send()
	};
	S.get_guild = (id) => {
		if (! id) S.throw(ver, "Unknown 'guild id'");
    S.tr2('get_guild', id);
		return (B.guilds.get(id) || false);
  	// { id, name, iconURL, region, memberCount, systemChannelID,
		//   joinedTimestamp, ownerID, members, channels, roles }
  	// --- <members>.get(id)
		// --- <channels>.get(id)
		// --- <roles>.get(id)
	};
	S.get_channel = (id) => {
		if (! id) Y.throw(ver, "Unknown 'channel id'");
    S.tr2('get_channel', id);
		if (B.channels) {
      S.tr3(`<client>.channels.get`, id);
			return (B.channels.get(id) || false);
		}
    if (B.guild && B.guild.channels) {
      S.tr3(`<client>.guild.channels.get`, id);
      return (B.guild.channels.get(id) || false);
		}
    return false;
  	// { type, id, name, parentID, topic, lastMessageID,
		//   lastPinTimestamp, guild { members, channels, roles, ... },
		// --- <channel>.send()
	};
	S.get_guild_member = (gid, mid) => {
		if (! gid) S.throw(ver, "Unknown 'guild id'");
		if (! id)  S.throw(ver, "Unknown 'member id'");
    S.tr2('get_guild_member', `[${gid}] [${mid}]`);
		const guild = S.get_guild(gid)
							 || S.throw(ver, "'guild' is not found");
		return (guild.members.get(mid) || false);
		// nickname, joinedTimestamp, _roles [],
		// user { bot, id, username, avatarURL, discriminator }
		// guild { members, channels, roles, ... }
		// --- <member>.send()
	};
  let SEND, SYSTEMCHID;
  if (S.debug() && R.im.debug_level && R.im.debug_level > 1) {
    const dv = P.im.devel;
    const send = SEND;
    SEND = (ch, msg, a) => {
      S.tr3('SEND: "' + dv.channel +  '"', msg);
      ch = S.get_channel(dv.channel);
      S.tr5(ch);
      return ch.send(msg).then(P.send2callback(a));
    };
    SYSTEMCHID = () => {
      S.tr1('systemChannelID - debug', dv.channel);
      return dv.channel;
    };
  } else {
    SEND = (ch, msg, a) => {
      S.tr3('SEND', msg);
      S.tr5(ch);
		  return ch.send(msg).then(P.send2callback(a));
    };
    SYSTEMCHID = (gid) => {
      S.tr1('systemChannelID - Call');
		  const guild = S.get_guild(gid)
			   || S.throw(ver, `'guild' is not found: ${gid}`);
      const sysCH = guild.systemChannelID || false;
      S.tr3('systemChannelID', `(${sysCH}) remote ??`);
		  return sysCH;
    };
  }
	S.systemChannelID = SYSTEMCHID;
	S.systemCH_send = (gid, msg, a) => {
    S.tr1('systemCH_send', gid);
		return S.channel_send(S.systemChannelID(gid), msg, a);
	};
	S.channel_send = (id, msg, a) => {
    S.tr1('channel_send', id);
		return SEND(S.get_channel(id), msg, a);
	};
	S.DMsend = (id, msg, a) => {
    S.tr1('DMsend', id);
		return SEND(S.get_user(id), msg, a);
	};
}
