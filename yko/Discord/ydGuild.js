'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ydGuild.js';
const ver = `yko/Discord/${my} v191013.01`;
//
module.exports.Unit = function (P) {
   const R = P.root;
   const S = R.unitKit(my, this, P.im, P.conf);
     S.ver = ver;
  S.parent = P;
   const T = S.tool;
  S.start = async (h) => {
    const H = h;
          S.handler = () => { return H };
          S.guildID = () => { return H.guild.id };
           S.userID = () => { return H.user.id };
        S.guildName = () => { return H.guild.name };
         S.nickname = () => { return H.nickname || false };
         S.username = () => { return H.user.username };
        S.avatarURL = () => { return H.user.avatarURL };
    S.discriminator = () => { return H.user.discriminator };
    return S;
  };
  S.join = async () => {
    const Gid = S.guildID();
    const Key = `discord.guilds.${Gid}.join`;
    S.tr3('guild:join', Key);
    let cf;
    await R.sysDB().get(Key).then(x=> cf = x );
    if (cf) {
      S.tr7('join(GUILD):sysDATA', cf);
      if (cf.msg1) S.DMsend
        (S.userID(), T.tmpl(cf.msg1, { name: S.guildName() }));
      if (cf.msg2) S.systemCH_send(Gid, cf.msg2, 300);
      if (cf.LogCH) {
        S.tr3('join(GUILD): Log channel', cf.LogCH);
        S.channel_send(cf.LogCH, EMBED(S, cf.color));
    } }
    return R.finish();
	};
	S.exit = async (Yo) => {
    const Gid = S.guildID();
    const Key = `discord.guilds.${Gid}.exit`;
    S.tr3('guild:exit', Key);
    let cf;
    await R.sysDB().get(Key).then(x=> cf = x );
    if (cf) {
      S.tr7('exit(GUILD):sysDATA', cf);
      if (cf.LogCH) {
        S.tr3('exit(GUILD): Log channel', cf.LogCH);
        S.channel_send(cf.LogCH, EMBED(S, cf.color));
    } }
//    P.MemberDB().view(Gid, S.userID())
//      .then( box => { if (box.aleady()) box.remove() })
//      .then(() => { S.finish() });
    return R.finish();
	};
         S.DMsend = P.Client().DMsend;
  S.systemCH_send = P.Client().systemCH_send;
   S.channel_send = P.Client().channel_send;
}
function EMBED (S, color) {
  let tmp, emoji = '';
  let now   = S.tool.time_form(0, 'YYYY/MM/DD HH:mm:ss');
  let embed = { author: {}, color: color, description: '' };
  let disc  = S.discriminator();
  if (tmp = S.avatarURL()) embed.author.icon_url = tmp;
  if (tmp = S.nickname()) {
	  embed.author.name = tmp;
	  embed.description = S.username() + `#${disc}\n`;
  } else {
	  embed.author.name = S.username() + `#${disc}`;
  }
  embed.description += '`<' + S.userID() + `> ` + now + '`';
  return { embed: embed };
}
