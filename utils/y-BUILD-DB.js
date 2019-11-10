//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my   = 'y-BUILD-DB.js';
const ver  = `utils/${my} v191110`;
const yko  = require('../yko/CORE.js');
const Y = new yko ();
//
const C = Y.conf;
const GuildID  = C.discord.devel.guild;
const TwitchCH = C.twitch.devel.chatChannel;
const LineID   = C.line.devel.userID; 
//
const yDB = require('./y-DB-Template-secret.js');
const UpdateOK = true;
//
let R;
Y.init().start(my).then(async unitRoot => {
  R = unitRoot;
  const Templates = yDB.templates(C);
  let BOX;
  for (let [Name, Id] of [
    ['Discord', GuildID ],
    ['Twitch',  TwitchCH],
    ['Line',    LineID  ]
  ]) {
    await R.sysDB(`${Name}.${Id}`).box().then(db=> BOX = db);
    if (BOX.hasNew()) {
	    Y.tr(`[BUILD:${Name}] New setup !!`);
      BOX.import( Templates[Name] ).prepar();
    } else if (UpdateOK) {
	    Y.tr(`[BUILD:${Name}] Update !!`);
      BOX.import( Templates[Name] ).prepar();
    } else {
      Y.tr('[BUILD:Discord] No update allowed !!');
    }
  }
}) .then(x=> {
  if (R) R.finish().then(x=> R.box.disconnect());
});
//
