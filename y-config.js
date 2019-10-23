//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
exports.ver = 'y-config.js v191023';
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
exports.discord = {
   sleep: 0,
      id: '< The bot own ID. >',
username: '< Bot name. >',
   token: '< Token to connect. >',
   devel: {
      guild: '( Guild ID used for development. )',
    channel: '( Channel ID used for development. )',
     userID: '( User ID used for development. )',
    webhook: {
    id: '( First half of webhook URL separated by '/'  )',
 token: '( Second half of webhook URL separated by '/'  )' 
    }
	}
};
exports.twitch = {
   sleep: 0,
clientID: '( Client ID. )',
secretID: '( Client Secret. )',
   devel: {
    chatChannel: '( Developer channel. )'
  },
   color: 0x7506394,
     url: {  base: 'https://www.twitch.tv/' },
     api: { users: 'https://api.twitch.tv/helix/users' },
    chat: {
       loginID: '( Chat login ID. )',
    oauthToken: '( https://twitchapps.com/tmi/ )',
channel_prefix: '#'
  }
};
exports.twitch.chat.tagetChannels = ['( Connected channel. )'];
//
exports.line = {
  CHtoken: '( Channel Token. )',
 CHsecret: '( Channel Secret. )',
    devel: {
      userID: '( UserID of bot assigned by Line. )'
  }
};
exports.http = {
  sleep: 0,
  port: 8000,
  HTDOC: {
    WH: { // 8-10 digits are safe
      '( Opportune string. )': { name: 'LINE' }
    },
    API: {
    }
  }
};
exports.cron = {
   sleep: 0,
interval: 3000,
   count: { max: 1000000 },
 job_RSS: {
      title: { low: 24, edit: 42 },
    history: { size: 5000 }
  }
};
