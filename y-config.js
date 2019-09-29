//
const MSG = messgae();
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
  log: {
    '384997595149500416': { // サタデーナイト
      join: {
        color: 0x0cb6e3,
        ch: '610174166712451092', // 参加者
        welcome: {
          type1: MSG.discord.join1,
          type2: MSG.discord.join2
        }
      },
      exit: {
        color: 0x411b70,
        ch: '610174357502951425' // 退出者
      }
    }
  },
  toTwitch: {
    '384997595149500416': { // サタデーナイト
      tageteCH: '525924113420648458',	// twitch-live
      toCH: 'milkyvishra'
    }
  }
};
exports.twitch = {
  url: { base: 'https://www.twitch.tv/' },
  api: {
    users: 'https://api.twitch.tv/helix/users',
  },
  color: 7506394,
  chat: {
    toDiscord: {
      'milkyvishra': {
        webhook: {
          id: '609208039182041098',
          token: 'gt03QUm0D-2TnpQbLMpX_3vfGABKB_pvl0XmMv_27TeMdOIBxDTLQLEm929FbtrnuxHZ'
        }
      }
    }
  }
};
exports.sysDATA = {
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
//
function messgae () {
  const here = require('here').here;
  let msg = {
    discord: {
      join2: 'まず「#🔰はじめに読んでね」に目を通して下さい。'
    }
  };
  msg.discord.join1 = here(/*
    <name> へようこそ!!
    
    わたしは、👆でお仕事をしてるボットです。
    
    「#🔰はじめに読んでね」に目を通しててから、
    「#🔰welcom」に自己紹介を投稿して下さい。
    
    それでは、今後とも宜しくお願い致します。
    */).unindent();
    return msg;
  };
