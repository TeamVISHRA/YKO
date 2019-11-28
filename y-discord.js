#!/usr/local/bin/node
'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const ver = `y-discord.js v191126`;
//
const yko = require('./yko/CORE.js');
const Y = new yko ();

advance();

Y.Discord.DebugCall().run()
  .then(Y.Next).catch(e => { Y.throw(e) });

function include () {
Y.init('yDiscord yTwitch yLINE yHTTP yLiquid yCRON'); 
}
function advance () {
// ===== < Discord > =====
Y.on('discord_message', (ydM, is) => {
  if (! is.cmd) return ydM.every();
  switch (is.cmd) {
    case 'dice':
      ydM.App('Dice').run(is.crum);
      break;
    case 'sp':
      ydM.App('Splittime').run(is.crum);
      break;
    case 'tool':
      ydM.App('Tools').run(is.crum);
      break;
    case 'unix':
      ydM.App('Tools').run(`unix ${is.crum}`);
      break;
    case 'utc':
      ydM.App('Tools').run(`utc ${is.crum}`);
      break;
    case 'ticket':
      ydM.App('Ticket').run(is.crum);
      break;
    case 'to':
      ydM.App('ToTwitch').run(is.crum);
      break;
    default:
      ydM.App('Help').run();
      break;
  }
});
Y.on('discord_join_guild', ydG => ydG.join());
Y.on('discord_exit_guild', ydG => ydG.exit());

// ===== < HTTP > =====
Y.on('http_responce', async (yH, is) => {
  if (! is.ident) return yH.responceNotFound();
  switch (is.ident) {
    case 'LINE':
      yH.Api('Line').run(is);
      break;
    default:
      yH.responceForbidden();
      break;
  }
});

// ===== < CRON > =====
Y.on('cron_day', (JOB, day, Now) => {
  if ((day% 10) == 0) {
    JOB('boxCleanTrash');
  }
});
Y.on('cron_minute', (JOB, minute, Now) => {
  if ((minute% 30) == 0) {
    JOB('cleanProcCash');
    JOB('brainCleanSleep');
  }
  if ((minute% 15) == 0) {
    JOB('DiscordAskRefresh');
    JOB('boxCleanCash');
  }
  if ((minute% 5) == 0) {
    JOB('DiscordRSS');	// Main
  }
  if ((minute% 2) == 0) {
    JOB('liquidReport');
  }
});
Y.on('cron_count', (JOB, count, Now) => {
  if ((count% 2) == 0) {
//		JOB('DiscordRSS'); // DEBUG
  }
});

// ===== < brain > =====
Y.on('brain_command_alias', [
  ['[サさ][イい][コこ][ロろ]', 'dice'],
  ['計測', 'sp'],
]);

include();
}
