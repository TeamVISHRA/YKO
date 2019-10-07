//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ydGuild.js';
const ver = `yko/Discord/${my} v191005.01`;
//
let S, Y, X, P, R, T, H;
module.exports = function (Y, P) {
  const S = this;
    S.ver = ver;
  const R = S.root = P.root;
    S.Ref = P.Ref;
  const T = Y.tool;
  //
  S.start = (h) => {
    H = h;
          S.guildID = () => { return H.guild.id };
           S.userID = () => { return H.user.id };
        S.guildName = () => { return H.guild.name };
         S.nickname = () => { return H.nickname || false };
         S.username = () => { return H.user.username };
        S.avatarURL = () => { return H.user.avatarURL };
    S.discriminator = () => { return H.user.discriminator };
    return S;
  };
  S.join = async (Yo) => {
    Y.tr3('join(GUILD)');
    const Gid = S.guildID();
    const Keys= ['discord', 'guilds', Gid, 'join'];
    let cf;
    await R.sysDB().cash(Keys).then(o=> { cf = o.value });
    if (cf) {
      Y.tr7('join(GUILD):sysDATA', cf);
      if (cf.msg1) S.DMsend
        (S.userID(), T.tmpl(cf.msg1, { name: S.guildName() }));
      if (cf.msg2) S.systemCH_send(Gid, cf.msg2, 300);
      if (cf.LogCH) {
        Y.tr3('join(GUILD): Log channel', cf.LogCH);
        S.channel_send(cf.LogCH, EMBED(Y, S, cf.color));
    } }
    return R.finish();
	};
	S.exit = async (Yo) => {
    Y.tr3('exit(GUILD)');
    const Gid = S.guildID();
    const Keys = ['discord', 'guilds', Gid, 'exit'];
    let cf;
    await R.sysDB().cash(Keys).then(o=> { cf = o.value });
    if (cf) {
      Y.tr7('exit(GUILD):sysDATA', cf);
      if (cf.LogCH) {
        Y.tr3('exit(GUILD): Log channel', cf.LogCH);
        S.channel_send(cf.LogCH, EMBED(Y, S, cf.color));
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
function EMBED (Y, S, color) {
  let tmp, emoji = '';
  let now   = Y.tool.time_form(0, 'YYYY/MM/DD HH:mm:ss');
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
