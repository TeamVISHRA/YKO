'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const ver = `y-discord.js v191008.01`;
//
const yko = require('yko');
const Y = new yko ();
const [,, ...ARGV] = process.argv;

advance();

let CallBack = () => {};
if (ARGV.length > 0) {
  Y.onFake();
  switch (ARGV.shift()) {
    case 'evM':
      CallBack = dbg => { dbg.$evMessage(ARGV.join(' ')) };
      break;
  }
}
Y.Discord.run().then(CallBack);

function include () {
Y.init('yDiscord'); // 'yTwitch', 'yHTTP', 'yCRON'
}
function advance () {
// ===== < Discord > =====
Y.on('discord_message', (ydM, is) => {
  let i; if (i = is.cmd) {
    if ( i == 'dice' ) {
      ydM.App('Dice').run(is.crum);
    } else if ( i == 'sp'   ) {
      ydM.App('Splittime').run(is.crum);
    } else if ( i == 'tool' ) {
      ydM.App('Tools').run(is.crum);
    } else if ( i == 'unix' ) {
      ydM.App('Tools').run(`unix ${is.crum}`);
    } else if ( i == 'to'   ) {
      ydM.App('ToTwitch').run(is.crum);
    } else {
      ydM.App('Help').run();
    }
  } else {
    ydM.every();
  }
});
Y.on('discord_join_guild', ydG => { ydG.join() });
Y.on('discord_exit_guild', ydG => { ydG.exit() });

// ===== < HTTP > =====
Y.on('http_api_action', (request, responce) => {
  
});

// ===== < CRON > =====
Y.on('cron_day', (X, yC, day, Now) => {
  if ((day% 10) == 0) {
    yC.exec('DAY1', X.box.cleanTrash);
  }
});
Y.on('cron_minute', (X, yC, minute, Now) => {
  if ((minute% 3) == 0) {
//    H.Job('DiscordRSS');	// Main
  }
  if ((minute% 10) == 0) {
    yC.exec('min1', X.Discord.expGuild.refresh);
    yC.exec('min2', X.sysDB().cleanCash);
  }
});
Y.on('cron_count', (X, yC, count, Now) => {
  if ((count% 2) == 0) {
    yC.exec('con1', X.box.cleanCash);
    yC.exec('con2', X.brain.cleanSleep);
		yC.Job('DiscordRSS'); // DEBUG
  }
});
Y.on('brain_command_alias', ()=> {
  return [
    ['[サさ][イい][コこ][ロろ]', 'dice'],
    ['計測', 'sp'],
  ];
});
include();
}
