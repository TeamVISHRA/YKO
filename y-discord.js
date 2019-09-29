//
// y-discord.js
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const ver = `y-discord.js v190929.01`;

const yko = require('./yko/CORE.js');
const Y = new yko ();

// ===== < Discord > =====
Y.on('discord_message', (MSG, is) => {
  let i; if (i = is.cmd) {
    if ( i == 'dice' ) {
      MSG.App('Dice').run(is.crum);
    } else if ( i == 'sp'   ) {
      MSG.App('Splittime').run(is.crum);
    } else if ( i == 'tool' ) {
      MSG.App('Tools').run(is.crum);
    } else if ( i == 'unix' ) {
      MSG.App('Tools').run(`unix ${is.crum}`);
    } else if ( i == 'to'   ) {
      MSG.App('ToTwitch').run(is.crum);
    } else {
      MSG.App('Help').run();
    }
  } else {
    D.Message().every(is);
  }
});
Y.on('discord_join_guild', H => {
  Y.Discord.Guild().join(H);
});
Y.on('discord_exit_guild', H => {
  Y.Discord.Guild().exit(H);
});

// ===== < HTTP > =====
Y.on('http_api_action', (request, responce) => {
  
});

// ===== < CRON > =====
Y.on('cron_day', (H, day, Now) => {
  if ((day% 10) == 0) {
    H.exec(Y.box.cleanTrash);
  }
});
Y.on('cron_minute', (H, minute, Now) => {
  if ((minute% 3) == 0) {
//    H.Job('DiscordRSS').run();	// Main
  }
  if ((minute% 10) == 0) {
    H.exec(Y.Discord.dbGuild.refresh);
    H.exec(Y.sysDATA.cleanCash);
  }
});
Y.on('cron_count', (H, count, Now) => {
  if ((count% 6) == 0) {
    H.exec(Y.box.cleanCash);
    H.exec(Y.brain.cleanSleep);
		H.Job('DiscordRSS').run(); // DEBUG
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
