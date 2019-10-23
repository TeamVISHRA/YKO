//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
//  Updated on 2019-10-23
//

let C, GuildID, TwitchCH, LineID;

module.exports.templates = function (c) {
  C = c;
  GuildID  = C.discord.devel.guild;
  TwitchCH = C.twitch.devel.chatChannel;
  LineID   = C.line.devel.userID; 
  return {
    Discord: dbDiscord(),
     Twitch: dbTwitch(),
       Line: dbLine()
  };
}
function dbDiscord () {
  //
  const joinMsg1 = `まず「#<chAgree>」に目を通して下さいね。`;
  //
  const joinMsg2 = `.
<gdName> へようこそ!!

わたしは、👆でお仕事をしてるボットです。

まず「#<chAgree>」に目を通してから、「#<chWelcom>」に自己紹介を投稿して下さいネ!!

**👀管理者が確認すると所定の権限が割り当てられます。**

ただし、リアルな仕事等の都合上、常にチェックしている訳ではありません。
場合によっては大変時間がかかる事がありますので気長にお待ち下さい。

\`※権限が割り当てられると、利用できるチャンネルが増えます。\`

それでは、今後とも宜しくお願い致します。
`;
  //
  return {
    join: { // join the guild.
      color: 0x2d4fe4,
       msg1: joinMsg1,
       msg2: joinMsg2,
      LogCH: '610174166712451092' // Logging channel ID.
  },
    exit: { // Exit the guild.
      color: 0x9f5520,
      LogCH: '610174357502951425' // Logging channel ID.
  },
toTwitch: {
       toCH: TwitchCH,
     fromCH: '579199949233717268', // Linked channel ID.
    message: 'HolidayOrnament <name>：<message>'
  },
toLine: {
   tokens: {
      '( From discord channel ID. )': '( To Line group ID. )'
    }
  },
    CRON: {
  RSSreader: {
          toCH: '613717562936655872', // News channel ID.
         sites: [
{ url: '( RSS URL No.1 )' },
{	url: '( RSS URL No.2 )' },
{ url: '( RSS URL No.2 )' }
        ]
      }
    },
webhooks: {
     devel: {
    id: '( First half of webhook URL separated by '/' )',
 token: '( Second half of webhook URL separated by '/' )' 
      },
twitchLive: {
    id: '( First half of webhook URL separated by '/' )',
 token: '( Second half of webhook URL separated by '/' )' 
      },
teamVishra: {
    id: '( First half of webhook URL separated by '/' )',
 token: '( Second half of webhook URL separated by '/' )' 
      }
    }
  };
}
function dbTwitch () {
  return {
     chat: {
 ignoreNames: [C.twitch.chat.loginID.toLowerCase()]
    },
toDiscord: {
    webhook: `%WK(${GuildID}.twitchLive)`,
    message: '>**<name>**：<message> -Twitch'
    }
  };
}
function dbLine () {
  return {
toDiscord: {
'C4296df248465af41c2b991db5bf16116': {
      webhook: `%WK(${GuildID}.teamVishra)`
      }
    }
  };
}
