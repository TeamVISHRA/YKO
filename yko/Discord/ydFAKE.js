//
// yko/Discord/ydFAKE.js
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ydFAKE.js';
const ver = `yko/Discord/${my} v190930.01`;
//
let S, Y, P;
module.exports = function (y, p) {
  this.ver = ver;
	[S, Y, P] = [this, y, p];
  S.$guildID   = P.im.devel.guild;
  S.$channelID = P.im.devel.channel;
  S.$userID    = P.im.devel.userID;
  baseHandler(S);
  const ON = {};
  S.on = (key, v) => {
    Y.tr3('on', key);
    ON[key] = v;
  };
	S.login = (token) => {
		if (ON.ready) ON.ready(S);
	};
  S.delete = () => {
    Y.tr('FAKE <message-delete>');
  };
  S.$ON = () => { return ON };
	S.$evMessage = (msg) => {
		if (! ON.message) Y.throw('Unknown on.message');
	};
	S.$evMessageBulk = (...msg) => {
		if (! ON.message) Y.throw('Unknown on.message');
	};
	S.$evJoinGuild = () => {
		if (! ON.guildMemberAdd)
				Y.throw('Unknown on.guildMemberAdd');
	};
	S.$evExitGuild = () => {
		if (! ON.guildMemberRemove)
				Y.throw('Unknown on.guildMemberRemove');
	};
	S.$AppDirect = () => {
		
	};
  S.$Exec = () => {
  };
}
function GuildHandler () {
	const H = this;
  H.nickname = '<FakeNick>';
  H.user  = S.users.get(S.$userID);
  H.guild = S.guilds.get(S.$guildID);
	return H;
}
function MessageHandler () {
	const H = this;
	return baseHandler(H);
}
function baseHandler (H) {
	H.users = new Map([
    [S.$userID, {
			bot: false,
      id: S.$userID,
			username:'<FakeUser>',
			avatarURL:'http://<avatarURL>',
			discriminator: 12345,
			lastMessageID: false,
			lastMessage: false,
      send: (s) => { return send('FAKE <user-send>', s) }
		} ]
	]);
  H.channels = new Map([
    [S.$channelID, {
      id: S.$channelID,
      send: (s) => { return send('FAKE <channel-send>', s) }
    } ]
  ]);
	H.guilds = new Map([
    [S.$guildID, {
		  id: S.$guildID,
		  name:'<FAKE_GUILD>',
		  iconURL: '<ICON_URL>',
		  ownerID: S.$userID,
		  memberCount: 100,
		  systemChannelID: S.$channelID,
		  joinedTimestamp: (Y.tool.unix() * 1000),
      send: (s) => { return send('FAKE <user-send>', s) },
      members: H.users,
      channels: H.channels,
		  roles: new Map([
        ['123456', { id:'123456', name:'SYSOP' }],
        ['123457', { id:'123456', name:'SYSOP' }],
        ['123458', { id:'123456', name:'SYSOP' }]
		  ])
	  } ]
  ]);
	return H;
}
function send (key, msg) {
  Y.tr(key, msg, '..... <<FAKE>>');
  return new Promise ( resolve => {
    return resolve({
      delete: () =>
      { Y.tr('FAKE <delete>', 'message-delete') },
      edit: () =>
      { Y.tr('FAKE <edit>', 'message-edit') }
    });
  });
}
