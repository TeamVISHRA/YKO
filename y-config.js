//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
exports.ver = 'y-config.js v191127';
//
const stc = require('./secrets/y-configuration.js');
//
exports.location    = stc.location;
exports.debug_level = stc.debug_level;
//
exports.brain = {
  cmd_prefix: stc.prefix,
  kuromojiDicPath: './node_modules/kuromoji/dict/',
  talk: { DataKeys: { type: 'YKO_TALK' } }
};
exports.log4js = {
  appenders: { debug: {
     type: 'file',
 filename: './log/YKO.log',
  pattern: 'YYYYMMDD'
  } },
 categories: { default: {
    appenders: ['debug'],
        level: 'all'
  } }
};
exports.inspect = {
         depth: 3,
//        colors: true,
//    showHidden: true,
//     showProxy: true,
// maxArayLength: 10,
//   breakLength: 120
};
exports.box = {
  db: 'Mongo',
  mongodb: {
    address: 'mongodb://localhost:27017',
     dbName: 'YKO',
   collections: {
  default: {
       name: 'General',
     schema: 'general'
    },
     cash: {
       name: 'Cash',
     schema: 'cash'
    },
    asset: {
       name: 'CryptoAsset',
     schema: 'general',
       conf: {
      columns: [
        ['type',     null, ['isKey']],
        ['year',     null, ['isString']],
        ['month',    null, ['isString']],
        ['day',      null, ['isString']],
        ['hour',     null, ['isString']],
        ['minute',   null, ['isString']],
        ['product',  null, ['isString']],
        ['highAsk',   '0', ['toString']],
        ['Ask',       '0', ['toString']],
        ['Bid',       '0', ['toString']],
        ['lowBid',    '0', ['toString']],
        ['price',     '0', ['toString']],
        ['symbol',   null, ['isString']],
        ['currency', null, ['isString']]
        ]
      }
    },
     line: {
       name: 'LineUsers',
     schema: 'member',
       conf: {
      columns: [
        ['userID',  null, ['isKey']],
        ['name',    null, ['isString']],
        ['iconURL', null, ['isStringEasy']],
        ['countPost',  0, ['isNumber']],
        ['tmLastPost', 'utc()', ['isUTC']],
        ['point',      0, ['isNumber']],
        ['level',      0, ['isNumber']],
        ['refreshTTL', 0, ['isNumber']]
        ]
      }
    },
  discord: {
       name: 'DiscordMembers',
     schema: 'member',
       conf: {
      columns: [
        ['userID',  null, ['isKey']],
        ['name',    null, ['isStringEasy']],
        ['guilds',    {}, ['isHashArray']],
        ['countPost',  0, ['isNumber']],
        ['tmLastPost', 'utc()', ['isUTC']],
        ['point',      0, ['isNumber']],
        ['level',      0, ['isNumber']]
        ]
      }
    },
   twitch: {
       name: 'TwitchListeners',
     schema: 'member',
       conf: {
      columns: [
        ['userID',   null, ['isKey']],
        ['countPost',  0, ['isNumber']],
        ['tmLastPost', 'utc()', ['isUTC']],
        ['point',      0, ['isNumber']],
        ['level',      0, ['isNumber']]
        ]
      }
    },
      log: {
       name: 'Logs',
     schema: 'log'
      }
    }
  },
  schema: {
    log: {
      $name: 'Log'
    },
   cash: {
     $name: 'CASH',
      TTL: 60, // 分
  min_TTL:  5, // 分
  max_TTL: (6* (30* (24* 60)))  // 分
    },
 member: {
     $name: 'Member'
    },
general: {
     $name: 'General'
    }
  }
};
exports.sysdata = {
     TTL: 20, // minute
identKey: 'system-config'
};
exports.web = {
  cashTTL: 10   // minute.
};
exports.discord = {
   sleep: stc.sleeps.discord,
      id: stc.discord.id,
username: stc.discord.username,
   token: stc.discord.token,
   devel: {
      guild: stc.discord.devel.guild,
    channel: stc.discord.devel.channel,
     userID: stc.discord.devel.userID,
    webhook: {
    id: stc.discord.devel.webhook.id,
 token: stc.discord.devel.webhook.token
    }
	}
};
exports.twitch = {
   sleep: stc.sleeps.twitch,
clientID: stc.twitch.clientID,
secretID: stc.twitch.secretID,
   devel: {
    chatChannel: stc.twitch.devel.chatChannel
  },
   color: 0x7506394,
     url: {  base: 'https://www.twitch.tv/' },
     api: { users: 'https://api.twitch.tv/helix/users' },
    chat: {
channel_prefix: '#',
       loginID: stc.twitch.chat.loginID,
    oauthToken: stc.twitch.chat.oauthToken,
 tagetChannels: stc.twitch.chat.chat_channel,
 loginChannels: [stc.twitch.devel.chatChannel]
  }
};
exports.line = {
  CHtoken: stc.line.CHtoken,
 CHsecret: stc.line.CHsecret,
    devel: { userID: stc.line.devel.userID },
  webhook: {
//    '[ Your own webhook token. ]'
      ...(stc.line.webhook)
  },
 responce: {
    froms: {
//    '[ from LINE ID (user or group or room) ]': {
//        toChannelID: '[ to Discord channelID ]'
//      },
//    '[ from LINE ID (user or group or room) ]': {
//        toUserID: '[ to Discord userID ]'
//      },
      ...(stc.line.responce.froms)
    }
  }
};
exports.liquid = {
  public: {
    report: {
      rate: 0.02,
      toDiscordCH: stc.discord.channels.asset
    },
    URL: 'https://api.liquid.com/products/',
    products: {
      BTCJPY: {
    code:  5,
   chart: 'https://sekai-kabuka.com/%E4%BB%AE%E6%83%B3%E9%80%9A%E8%B2%A8%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E3%83%93%E3%83%83%E3%83%88%E3%82%B3%E3%82%A4%E3%83%B3%E5%9B%BD%E5%86%85.html'
      },
      XRPJPY: {
    code: 83,
   chart: 'https://sekai-kabuka.com/%E4%BB%AE%E6%83%B3%E9%80%9A%E8%B2%A8%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88/%E3%83%AA%E3%83%83%E3%83%97%E3%83%AB.html'
      }
    }
  }
};
exports.google = {
  api: {
translate: {
    account: stc.google.api.translate.account,
         id: stc.google.api.translate.id
    }
  }
}; 
exports.http = {
  sleep: stc.sleeps.http,
   port: 8000
};
exports.cron = {
   sleep: stc.sleeps.cron,
interval: 3000,
   count: { max: 1000000 },
 job_RSS: {
      title: { low: 24, edit: 42 },
    history: { size: 5000 }
  }
};
exports.help = { url: stc.help.url };
