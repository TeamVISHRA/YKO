//
exports.log4js = {
  appenders: { debug: {
    type: 'file',
    filename: './YKO.log',
    pattern: 'YYYYMMDD'
  } },
  categories: { default: {
    appenders: ['debug'],
    level : 'all'
  } }
}
exports.discord = {
};
exports.twitch = {
  color: 7506394,
  url: { base: 'https://www.twitch.tv/' },
  api: {
    users: 'https://api.twitch.tv/helix/users',
  },
  chat: {}
};
exports.sysdata = {
  limit: 15, // minute
  keys: {
    type: 'system',
    id:   '__YKO_SYSTEM__',
    name: '__YKO_SYSTEM_DATA__'
  }
};
exports.brain = {
  talk: {
    DataKeys: {
      type: 'YKO_TALK',
    }
  }
};
exports.google = {
  api: {
    translate: 'https://www.googleapis.com/language/translate/v2/'
  }
};
exports.box = {
  db: 'Mongo',
  mongodb: {
    address: 'mongodb://localhost:27017',
    dbName: 'YKO',
    collection: 'container'
  },
  container: {
    cash: {
      default_life: 60,              // 分
      min_life:      5,              // 分
      max_life: (6* (30* (24* 60)))  // 分
    }
  },
  list: {
    column: {
      ident: 'aux',
      max: 20
    }
  },
  trash: {
  }
};
exports.http = {
  port: 8000,
};
exports.amazon = {
};
exports.help = {
  url: 'https://drive.google.com/uc?id=1N3VfjMqmg7ax3wWTUCbfTab4r4pzKBaU'
};
exports.cron = {
  interval: 3000,
  count: { max: 1000000 },
  job_RSS: {
    title: { low: 24, edit: 42 },
    history: { size: 5000 }
  }
};
