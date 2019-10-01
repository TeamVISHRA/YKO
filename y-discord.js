//
// y-discord.js
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const ver = `y-discord.js v191001.01`;

const yko = require('./yko/CORE.js');
const Y = new yko ();

// ===== < Discord > =====
Y.on('discord_message', (Xm, is) => {
  let i; if (i = is.cmd) {
    if ( i == 'dice' ) {
      Xm.App('Dice').run(Y, is.crum);
    } else if ( i == 'sp'   ) {
      Xm.App('Splittime').run(Y, is.crum);
    } else if ( i == 'tool' ) {
      Xm.App('Tools').run(Y, is.crum);
    } else if ( i == 'unix' ) {
      Xm.App('Tools').run(Y, `unix ${is.crum}`);
    } else if ( i == 'to'   ) {
      Xm.App('ToTwitch').run(Y, is.crum);
    } else {
      Xm.App('Help').run(Y);
    }
  } else {
    Xm.every(Y, is);
  }
});
Y.on('discord_join_guild', (GL, H) => {
  GL.join(H);
});
Y.on('discord_exit_guild', H => {
  GL.exit(H);
});

// ===== < HTTP > =====
Y.on('http_api_action', (request, responce) => {
  
});

// ===== < CRON > =====
Y.on('cron_day', (H, day, Now) => {
  if ((day% 10) == 0) {
    H.exec('DAY1', Y.box.cleanTrash);
  }
});
Y.on('cron_minute', (H, minute, Now) => {
  if ((minute% 3) == 0) {
//    H.Job('DiscordRSS');	// Main
  }
  if ((minute% 10) == 0) {
    H.exec('min1', Y.Discord.dbGuild.refresh);
    H.exec('min2', Y.sysDATA.cleanCash);
  }
});
Y.on('cron_count', (H, count, Now) => {
  if ((count% 2) == 0) {
    H.exec('con1', X => { return X.box.cleanCash });
    H.exec('con2', Y.brain.cleanSleep);
		H.Job('DiscordRSS'); // DEBUG
  }
});
Y.brain.on('command_alias', ()=> {
  return [
    ['[サさ][イい][コこ][ロろ]', 'dice'],
    ['計測', 'sp'],
  ];
});
// ===== < INIT > ========
Y.init(
  'yDiscord:init',
  'yTwitch:init',
  'yHTTP:init',
  'yCRON:init'
);
// ===== < Debug > =======
//Y.preparFake();
// ===== < Execute > =====
Y.Discord.run()
//.then(test=> { test.$evMessage('あいうえお') });
