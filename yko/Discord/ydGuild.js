//
// yko/Discord/ydMessage.js
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ydGuild.js';
const ver = `yko/Discord/${my} v190926.01`;
//
let S, Y, P, T;
module.exports = function (Y, P) {
  this.ver = ver;
  [S, Y, P, T] = [this, Y, P, Y.tool];
  if (Y.REQ1() == 'Discord') build_component();
};
//
function build_component () {
  Y.tr1('build_component');
	let H;
  S.join = async (h) => {
    Y.tr1('join(GUILD)');
		S.start(h);
    let c;
    const Gid = S.guildID();
    const Keys= ['discord', 'guilds', Gid, 'join'];
    await Y.sysDATA.cash(Keys).then(db=> { c = db.value });
    if (c) {
      Y.tr5('join(GUILD):sysDATA', c);
      if (c.msg1) S.DMsend(S.userID(),
          T.tmpl(c.msg1, { name: S.guildName() }));
      if (c.msg2) S.systemCH_send(Gid, c.msg2, 300);
      if (c.LogCH) {
        Y.tr2('join(GUILD): Log channel', c.LogCH);
        S.channel_send(c.LogCH, LOG(c.color));
      }
		}
    return S.finish();
	};
	S.exit = async (h) => {
    Y.tr1('exit(GUILD)');
		S.start(h);
    let c;
    const Gid = S.guildID();
    const Keys = ['discord', 'guilds', Gid, 'exit'];
    await Y.sysDATA.cash(Keys).then(db=> { c = db.value });
    if (c) {
      Y.tr5('exit(GUILD):sysDATA', c);
      if (c.LogCH) S.channel_send(c.LogCH, LOG(c.color));
    }
//    Y.Discord.MemberDB().view(Gid, S.userID())
//      .then( box => { if (box.aleady()) box.remove() })
//      .then(() => { S.finish() });
    return S.finish();
	};
	S.guildID    = () => { return H.guild.id };
	S.guildName  = () => { return H.guild.name };
	S.nickname   = () => { return H.nickname || false };
	S.userID     = () => { return H.user.id };
	S.username   = () => { return H.user.username };
	S.avatarURL  = () => { return H.user.avatarURL };
	S.discriminator = () => { return H.user.discriminator };
  S.DMsend        = P.Client().DMsend;
  S.systemCH_send = P.Client().systemCH_send;
  S.channel_send  = P.Client().channel_send;
  //
	S.start = (h) => {
    H = h;
    Y.start();
  };
	S.rollback = () => {
    //H = false
    Y.rollback();
  };
	S.finish = () => {
    //H = false
    Y.finish();
  };
  const LOG = (color) => {
	  let tmp;
	  let emoji = '';
	  let now = Y.tool.time_form(0, 'YYYY/MM/DD HH:mm:ss');
	  let embed = { author: {}, color: color, description: '' };
	  if (tmp = S.avatarURL()) embed.author.icon_url = tmp;
	  let disc = S.discriminator();
	  if (tmp = S.nickname()) {
		  embed.author.name = tmp;
		  embed.description = S.username() + `#${disc}\n`;
	  } else {
		  embed.author.name = S.username() + `#${disc}`;
	  }
	  embed.description += '`<' + S.userID() + `> ` + now + '`';
	  return { embed: embed };
  };
}
