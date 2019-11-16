'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ydGuild.js';
const ver = `yko/Discord/${my} v191116`;
//
module.exports.Unit = function (P) {
   const R = P.root;
   const S = R.unitKit(my, this, P);
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
  const sdKey = () => { return P.sdKey(S.guildID()) };
  S.join = async () => {
    const Gid = S.guildID();
    S.tr3('[Discord:G] join', S.userID());
    R.sysDB(sdKey()).cash().then(cf => {
      if (cf && cf.join) {
        const jc = cf.join;
        if (cf.channels) {
          S.tr3('[Discord:G] channels OK');
          if (jc.chMsg) {
            S.tr3('[Discord:G] chMsg OK');
            P.tmpl(Gid, jc.chMsg, cf.channels)
             .then(msg=> S.DMsend(S.userID(), msg) );
          }
          if (jc.dmMsg) {
            S.tr3('[Discord:G] dmMsg OK');
            P.tmpl(Gid, jc.dmMsg, cf.channels)
             .then(msg=> S.systemCH_send(Gid, msg, 300) );
          }
        }
        if (jc.LogCH) {
          S.tr3('[Discord:G] join: Log channel', jc.LogCH);
          S.channel_send(jc.LogCH, EMBED(S, jc.color));
        }
      }
      R.finish();
    });
  };
  S.exit = async () => {
    const [Gid, Uid] = [S.guildID(), S.userID()];
    S.tr3('[Discord:G] exit', Uid);
    R.sysDB(sdKey()).cash().then(cf=> {
      if (cf && cf.exit) {
        const ec = cf.exit;
        S.tr7('[Discord:G] exit:sysDB', ec);
        if (ec.LogCH) {
          S.tr3('[Discord:G] exit: Log channel', ec.LogCH);
          S.channel_send(ec.LogCH, EMBED(S, ec.color));
        }
      }
      R.sysDB(`Discord`).member(Uid).then(md=> {
        if (! md.hasNew() && md.get('guilds')[Gid])
            { md.util().rmHash('guilds', Gid).prepar() }
      });
      R.finish();
    });
  };
          S.DMsend = P.Client().DMsend;
   S.systemCH_send = P.Client().systemCH_send;
    S.channel_send = P.Client().channel_send;
    S.get_channerl = P.Client().get_channel;
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
