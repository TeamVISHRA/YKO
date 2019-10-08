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
Y.Discord.run().then(CallBack)
 .catch(e => { Y.throw(ver, e) });

function include () {
Y.init('yDiscord', 'yCRON'); // 'yTwitch', 'yHTTP', 
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
Y.on('cron_day', (JOB, day, Now) => {
  if ((day% 10) == 0) {
    JOB('boxCleanTrash');
  }
});
Y.on('cron_minute', (JOB, minute, Now) => {
  if ((minute% 3) == 0) {
    JOB('DiscordRSS');	// Main
  }
  if ((minute% 10) == 0) {
    JOB('DiscordAskGuildRefresh');
    JOB('sysDBcleanCash');
  }
});
Y.on('cron_count', (JOB, count, Now) => {
  if ((count% 2) == 0) {
    JOB('boxCleanCash');
    JOB('brainCleanSleep');
//		JOB('DiscordRSS'); // DEBUG
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
