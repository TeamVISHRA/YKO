//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ydFAKE.js';
const ver = `yko/Discord/${my} v191008.01`;
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
  const evMSG = (type, msg) => {
    if (! ON.message) Y.throw('Unknown on.message');
    return ON.message( MessageHandler(type, msg) );
  };
  S.$evMessage   = (msg) => { evMSG(false, msg) };
  S.$evMessageDM = (msg) => { evMSG('dm',  msg) };
  S.$evMessageBulk = (iv, ...o) => {
    Y.tr('$evMessageBulk');
    if (! o || o.length < 1) Y.throw(ver, 'Unknown args');
    let [count, timer] = [0];
    const Bulk = () => {
      let [msg, type] = o.shift();
      type = type ? 'dm' : 'msg';
      Y.tr(`\n Bulk(${++count}) [${type}] ${msg}`);
      evMSG((type == 'dm' ? type : false), msg);
      if (o.length <= 0) clearInterval(timer);
    };
    Bulk();
    if (o > 1) timer = setInterval(Bulk, (iv || 500));
    Y.tr(`=====< $evMessageBulk complete >=====`);
  };
  S.$evJoinGuild = () => {
    if (! ON.guildMemberAdd)
        Y.throw('Unknown on.guildMemberAdd');
    return ON.guildMemberAdd( GuildHandler() );
  };
  S.$evExitGuild = () => {
    if (! ON.guildMemberRemove)
        Y.throw('Unknown on.guildMemberRemove');
    return ON.guildMemberRemove
                ( nickname( GuildHandler() ) );
  };
  S.$Exec = () => {
  };
}
function GuildHandler () {
  const H = baseHandler({});
  H.user  = user();
  H.guild = guild();
	return H;
}
function MessageHandler (type, msg) {
  const H = baseHandler({});
  H.content = msg;
  H.delete  = () => { Y.tr('<message-delete>') };
  H.reply   = (s) => { return send('[[ REPLY ]]', s) };
  H.guild   = guild();
  H.channel = channel();
  H.channel.type = type;
  H.member = user();
  nickname(H.member);
  H.author = H.user = user();
  H.delete = Delete();
  H.edit   = Edit();
  return H;
}
let GUILD;
function guild (H) {
  return GUILD || (GUILD = {
    id: S.$guildID,
    name:'<FAKE_GUILD>',
    iconURL: '<ICON_URL>',
    ownerID: S.$userID,
    memberCount: 100,
    systemChannelID: S.$channelID,
    joinedTimestamp: (Y.tool.unix() * 1000),
    members: H.users,
    channels: H.channels,
    roles: new Map([
      ['123456', { id:'123456', name:'SYSOP' }],
      ['123457', { id:'123456', name:'SYSOP' }],
      ['123458', { id:'123456', name:'SYSOP' }]
    ])
  });
}
function nickname (H) {
  H.nickname = '<NickName-Fake>';
  return H;
}
let CHANNEL;
function channel () {
  return CHANNEL || (CHANNEL = {
    id: S.$channelID,
    name: 'FAKE-CHANNEL',
    send: (s) => { return send('<channel-send>', s) }
  });
};
let USER;
function user () {
  return USER || (USER = {
    bot: false,
    id: S.$userID,
    username:'<FakeUser>',
    avatarURL:'http://<avatarURL>',
    discriminator: 12345,
    lastMessageID: false,
    lastMessage: false,
    send: (s) => { return send('<user-send>', s) }
  });
}
function baseHandler (H) {
  H.users    = new Map([[ S.$userID,    user()    ]]);
  H.channels = new Map([[ S.$channelID, channel() ]]);
  H.guilds   = new Map([[ S.$guildID,   guild(H)  ]]);
  return H;
}
function Delete () {
  return () => { Y.tr('FAKE <delete>', 'message-delete') };
}
function Edit () {
  return () => { Y.tr('FAKE <edit>', 'message-edit') };
}
function result () {
  return { delete: Delete(), edit: Edit() };
}
function send (key, msg) {
  Y.tr(key, '..... <<FAKE>>', msg);
  return new Promise
      ( resolve => { return resolve(result()) });
}
