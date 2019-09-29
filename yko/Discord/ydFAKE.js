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
  baseHandler(S);
  const ON = {};
  S.on = (key, v) => {
    Y.tr3('on', key);
    ON[key] = v;
  };
	S.login = (token) => {
		if (ON.ready) ON.ready(new ClientHandler ());
	}
	//
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
  H.user  = S.users.get('297079697668571146');
  H.guild = S.guilds.get('384997595149500416');
	return H;
}
function MessageHandler () {
	const H = this;
	return baseHandler(H);
}
function baseHandler (H) {
	H.users = new Map([
    ['297079697668571146', {
			bot: false,
      id: '297079697668571146',
			username:'FakeUser',
			avatarURL:'<avatarURL>',
			discriminator: 12345,
			lastMessageID: false,
			lastMessage: false,
      send: (s) => { return send('user-send', s) }
		} ]
	]);
  H.channels = new Map([
    ['606506515050004480', {
      id: '606506515050004480',
      send: (s) => { return send('channel-send', s) }
    } ]
  ]);
	H.guilds = new Map([
    ['384997595149500416', {
		  id: '384997595149500416',
		  name:'<FAKE_GUILD>',
		  iconURL:'<ICON_URL>',
		  ownerID:'297079697668571146',
		  memberCount: 100,
		  systemChannelID: '606506515050004480',
		  joinedTimestamp: 10000000000,
      send: (s) => { return send('user-send', s) },
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
  Y.tr(key, msg);
  return Promise.resolv({
    delete: () => { Y.tr('send', 'message-delete') },
    edit: () => { Y.tr('send', 'message-edit') }
  });
}
