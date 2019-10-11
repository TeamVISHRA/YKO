'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ydFAKE.js';
const ver = `yko/Discord/${my} v191010.01`;
//
module.exports.call = function (Y, P, ARGV) {
  Y.onFake();
  switch (ARGV.shift()) {
    case 'evM':
      Y.Next = x => { x.$evMessage(ARGV.join(' ')) };
      break;
    case 'evJoin':
      Y.Next = x => { x.$evJoinGuild() };
      break;
    case 'evExit':
      Y.Next = x => { x.$evExitGuild() };
      break;
    case 'cron':
      if (! ARGV[0])
          Y.throw('YKO> Something is missing ...!?');
      Y.Next = x => { x.$Cron(...ARGV) };
      break;
  }
  return P;
};
let S, Y, P;
module.exports.on = function (y, p) {
  this.ver = ver;
  [S, Y, P] = [this, y, p];
      S.$guildID = P.im.devel.guild;
    S.$channelID = P.im.devel.channel;
       S.$userID = P.im.devel.userID;
  S.$channelName = 'FAKE-CHANNEL';
  S.$TieTwitchCH = '579199949233717268';
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
  S.$Cron = (...name) => {
    const CRON  = Y.rack.get('CRON').$JS;
    const START = CRON.START(Y, S);
    if (name == 'all' || name == '-a') {
      const Ct = require('../CRON/ycJOBS.js');
      for (let key in Ct.Collect()) { START(key) }
    } else {
      START(...name);
    }
  };
}
function GuildHandler () {
  Y.tr5('GuildHandler');
  const H = baseHandler({});
  H.user  = user();
  H.guild = guild();
	return H;
}
function MessageHandler (type, msg) {
  Y.tr5('MessageHandler');
  const H = baseHandler({});
  H.content = msg;
  H.delete  = () => { Y.tr('<message-delete>') };
  H.reply   = (s) => { return send('[[ REPLY ]]', s) };
  H.guild   = guild(H);
  H.channel = channel(S.$channelID, S.$channelName);
  H.channel.type = type;
  H.member = user();
  nickname(H.member);
  H.author = H.user = user();
  H.delete = Delete();
  H.edit   = Edit();
  return H;
}
function guild (H) {
  Y.tr5('guild');
//Y.tr( H.channels.get() ); //.channels.get(S.$channelID) );
  return {
    id: S.$guildID,
    name:'<FAKE_GUILD>',
    iconURL: '<ICON_URL>',
    ownerID: S.$userID,
    memberCount: 100,
    systemChannelID: S.$channelID,
    joinedTimestamp: (Y.tool.unix() * 1000),
    members:  users(),
    channels: channels(),
    roles: new Map([
      ['123456', { id:'123456', name:'SYSOP' }],
      ['123457', { id:'123456', name:'SYSOP' }],
      ['123458', { id:'123456', name:'SYSOP' }]
    ])
  };
}
function nickname (H) {
  Y.tr5('nickname');
  H.nickname = '<NickName-Fake>';
  return H;
}
function channel (channelID, channelName) {
  Y.tr5('channel');
  return {
      id: channelID,
    name: channelName,
    send: (s) => { return send('<channel-send>', s) }
  };
};
function user () {
  Y.tr5('user');
  return {
    bot: false,
    id: S.$userID,
    username:'<FakeUser>',
    avatarURL:'http://<avatarURL>',
    discriminator: 12345,
    lastMessageID: false,
    lastMessage: false,
    send: (s) => { return send('<user-send>', s) }
  };
}
function guilds () {
  return new Map([[S.$guildID, guild()]]);
}
function channels () {
  Y.tr5('channels');
  return new Map([
    [  S.$channelID, channel(S.$channelID,   S.$channelName)],
    [S.$TieTwitchCH, channel(S.$TieTwitchCH, 'Twitch-Tieup')]
  ]);
}
function users () {
  return new Map([[S.$userID, user()]]);
}
function baseHandler (H) {
  Y.tr5('baseHandler');
     H.users = users();
    H.guilds = guilds();
  H.channels = channels();
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
