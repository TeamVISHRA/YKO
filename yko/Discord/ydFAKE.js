'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ydFAKE.js';
const ver = `yko/Discord/${my} v191103`;
//
module.exports.call = function (P) {
  const Y = P.un;
  const ARGV = Y.ARGV.get();
  Y.tr3('[Discord:F] Debug:call', ARGV);
  Y.onFake();
  switch (ARGV.shift()) {
    case '-m':
      Y.Next = x => { x.$evMessage(ARGV.join(' ')) };
      break;
    case '-join':
      Y.Next = x => { x.$evJoinGuild() };
      break;
    case '-exit':
      Y.Next = x => { x.$evExitGuild() };
      break;
    case '-cron':
      Y.Next = x => { x.$Cron(...ARGV) };
      break;
  }
  return P;
};
let S, Y, P;
module.exports.on = function (p) {
  S = this;
  S.ver = ver;
  [P, Y] = [p, p.un];
      S.$guildID = P.conf.devel.guild
          || P.throw(`[Fake] Unknown '<devel>.guild'.`);
    S.$channelID = P.conf.devel.channel
          || P.throw(`[Fake] Unknown '<devel>.channel'.`);
       S.$userID = P.conf.devel.userID
          || P.throw(`[Fake] Unknown '<devel>.userID'.`);
  S.$channelName = 'FAKE-CHANNEL';
  S.$TieTwitchCH = '579199949233717268';
  P.tr(`[Fake] Setting:`,
      `guildID: ${S.$guildID}`,
    `channelID: ${S.$channelID}`,
       `userID: ${S.$userID}`,
  `channelName: ${S.$channelName}`,
  `TieTwitchCH: ${S.$TieTwitchCH}`
  );
  baseHandler(S);
  const ON = {};
  S.on = (key, v) => {
    Y.tr4('[Discord:F] on', key);
    ON[key] = v;
  };
  S.login = (token) => {
    if (ON.ready) ON.ready(S);
  };
  S.delete = () => {
    Y.tr('[Discord:F] <message-delete>');
  };
  S.$ON = () => { return ON };
  const evMSG = (type, msg) => {
    if (! ON.message) Y.throw('[Discord:F] Unknown on.message');
    ON.message( MessageHandler(type, msg) );
  };
  S.$evMessage   = (msg) => { evMSG(false, msg) };
  S.$evMessageDM = (msg) => { evMSG('dm',  msg) };
  S.$evMessageBulk = (iv, ...o) => {
    Y.tr('$evMessageBulk');
    if (! o || o.length < 1)
        Y.throw(ver, '[Discord:F] Unknown args');
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
    Y.tr(`[Discord:F] =====< $evMessageBulk complete >=====`);
  };
  S.$evJoinGuild = () => {
    if (! ON.guildMemberAdd)
        Y.throw('[Discord:F] Unknown on.guildMemberAdd');
    return ON.guildMemberAdd( GuildHandler() );
  };
  S.$evExitGuild = () => {
    if (! ON.guildMemberRemove)
        Y.throw('[Discord:F] Unknown on.guildMemberRemove');
    return ON.guildMemberRemove
                ( nickname( GuildHandler() ) );
  };
  S.$Cron = async (...name) => {
    const JS = Y.rack.get('CRON').$JS;
    const START = JS.START(Y);
    if (name[0]) return START(...name);
    const Jobs = (require('../CRON/ycJOBS.js')).Collect(S);
    for (let key in Jobs) { START(key) }
    return S;
  };
}
function GuildHandler () {
  Y.tr6('[Discord:F] GuildHandler');
  const H = baseHandler({});
  H.user  = user();
  H.guild = guild();
	return H;
}
function MessageHandler (type, msg) {
  Y.tr6('[Discord:F] MessageHandler');
  const H = baseHandler({});
  H.content = msg;
  H.delete  = () => { Y.tr('[Discord:F] <message-delete>') };
  H.reply   = (s) => { return send('<REPLY>', s) };
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
  Y.tr6('[Discord:F] guild');
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
  Y.tr6('[Discord:F] nickname');
  H.nickname = '<NickName-Fake>';
  return H;
}
function channel (channelID, channelName) {
  Y.tr6('[Discord:F] channel');
  return {
      id: channelID,
    name: channelName,
    send: (s) => { return send('<channel-send>', s) }
  };
};
function user () {
  Y.tr6('[Discord:F] user');
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
  Y.tr6('[Discord:F] channels');
  return new Map([
    [  S.$channelID, channel(S.$channelID,   S.$channelName)],
    [S.$TieTwitchCH, channel(S.$TieTwitchCH, 'Twitch-Tieup')]
  ]);
}
function users () {
  return new Map([[S.$userID, user()]]);
}
function baseHandler (H) {
  Y.tr6('[Discord:F] baseHandler');
     H.users = users();
    H.guilds = guilds();
  H.channels = channels();
  return H;
}
function Delete () {
  return () => { Y.tr('[Discord:F] <delete>', 'message-delete') };
}
function Edit () {
  return () => { Y.tr('[Discord:F] <edit>', 'message-edit') };
}
function result () {
  return { delete: Delete(), edit: Edit() };
}
function send (key, msg) {
  Y.tr(key, '[Discord:F] send:', msg);
  return new Promise
      ( resolve => { return resolve(result()) });
}
