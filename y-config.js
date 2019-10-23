//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
//  Updated on 2019/10/23.
//
exports.location = 'devel';
exports.debug_level = 4;
//
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
exports.brain = {
cmd_prefix: ':',
      talk: { DataKeys: { type: 'YKO_TALK' } }
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
     line: {
       name: 'LineUsers',
     schema: 'member'
    },
  discord: {
       name: 'DiscordMembers',
     schema: 'member',
       conf: {
      columns: ['games', 'roles', 'in', 'age', 'tZone']
      }
    },
   twitch: {
       name: 'TwitchListeners',
     schema: 'member',
       conf: {
      columns: ['countPost']
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
      TTL: 60, // minute.
  min_TTL:  5, // minute.
  max_TTL: (6* (30* (24* 60)))  // minute.
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
     TTL: 20, // minute.
identKey: 'system-config'
};
exports.discord = {
   sleep: 1,
      id: `< The bot own ID. >`,
username: '< Bot name. >',
   token: '< Token to connect. >',
   devel: {
      guild: '< Guild ID used for development. >',
    channel: '< Channel ID used for development. >',
     userID: '< User ID used for development. >',
    webhook: {
    id: `< First half of webhook URL separated by '/'  >`,
 token: `< Second half of webhook URL separated by '/'  >`
    }
	},
  toLine: {
    '< From any token. >': '< To Line ID. >'
  }
};
exports.twitch = {
   sleep: 1,
clientID: '< Client ID. >',
secretID: '< Client Secret. >',
    chat: {
      loginID: '< Chat login ID. >',
tagetChannels: [`< Connected channel. >`], // '#' Omit
   oauthToken: '< https://twitchapps.com/tmi/ >'
  },
   color: 0x7506394,
     url: {  base: 'https://www.twitch.tv/' },
     api: { users: 'https://api.twitch.tv/helix/users' }
};
exports.line = {
  CHtoken: '< Channel Token. >',
 CHsecret: '< Channel Secret. >'
};
exports.google = {
};
exports.http = {
  sleep: 0,
  port: 8000,
  HTDOC: {
    WH: {
      '< Opportune string. >': { name: 'LINE' } // 8-10 digits are safe
    },
    API: {
    }
  }
};
exports.cron = {
   sleep: 1,
interval: 3000,
   count: { max: 1000000 },
 job_RSS: {
      title: { low: 24, edit: 42 },
    history: { size: 5000 }
  }
};
exports.help = {
  url: 'https://drive.google.com/uc?id=1N3VfjMqmg7ax3wWTUCbfTab4r4pzKBaU'
};
