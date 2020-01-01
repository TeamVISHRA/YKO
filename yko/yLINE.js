'use strict';
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'yLINE.js';
const ver = `yko/${my} v191202`;
//
 const SDK = require('@line/bot-sdk'),
    Accept = require('./LINE/ylAccept.js'),
  Responce = require('./LINE/ylResponce.js'),
 FlexStyle = require('./LINE/ylFlexStyle.js'),
RefreshTTL = 48* 60, // minute.
  Defaults = {
       MaxText: 800,
    MaxaltText: 400
  };
//
let STATE = 'Normal';
//
module.exports.Super = function (Y, Ref) {
  Y.throw(`[LINE] ${my}`, 'Cannot operate with Super.');
}
module.exports.Unit = function (R, Ref) {
  const U = R.unitKit('line', this, R, Ref);
  U.ver = `${ver} :U`;
  Ref.$unit(U);
}
module.exports.init = function (Y, Ref) {
  const G = Y.superKit('line', this, Y, Ref);
  G.ver = `${ver} :G`;
  build_guest_comps(G);
}
module.exports.initFake = function (Y, Ref) {
//  Y.tr4('[Twitch] exports.onFake');
//  Ref.$onFake = U => { onFake(Y, Ref) };
}
function build_guest_comps (G) {
  const CF = G.conf;
  if (! CF.CHtoken || ! CF.CHsecret) {
    G.throw(`[Line] Need to check configuration.`);
  }
  const Meth = G.rack.has('Discord') ? 'toDiscord': 'unDiscord';
  //
  G.Ref.$unit = U => {
    U.client = client;
    build_unit_comps(U, Meth);
  };
  let Bot;
  function client () {
    return Bot || (Bot = new SDK.Client ({
channelAccessToken: CF.CHtoken,
     channelSecret: CF.CHsecret
    }));
  }
}
function build_unit_comps (U, Meth) {
  const R = U.root,
        T = U.tool;
           U.accept = new Accept.Unit(U),
         U.responce = new Responce[Meth](U),
           U.replys = new REPLYS (U),
     U.replyMessage = replyMessage,
      U.pushMessage = pushMessage,
      U.textMessage = textMessage,
      U.flexMessage = flexMessage,
 U.flexMessageStyle = flexMessageStyle,
       U.getProfile = getProfile,
  U.profileFromLine = profileFromLine;
  //
  async function replyMessage (token, json) {
    U.tr4(`[LINE] replyMessage:`, token, json);
    return U.client().replyMessage(token, json);
  }
  async function pushMessage (id, json) {
    U.tr4(`[LINE] pushMessage:`, id, json);
    if (U.replys.hasInvalid()) return { invalid: true };
    await U.client().pushMessage(id, json);
    return { success: true };
  }
  async function switchSend (DiscordCH, to, json) {
    const Token = U.replys.get(to);
    if (Token) {
      let success;
      await replyMessage(Token, json)
      .then(x=> success = true)
      .catch(e=> {
        if (e.statusCode) {
          if (e.statusCode == 400) {
            return switchSend(DiscordCH, to, json);
          } else if (e.statusCode == 429) {
            return SetInvalid();
          }
        }
        pushMSG(DiscordCH, to, json)
          .then(x=> pushReport(DiscordCH, x));
      });
    } else {
      pushMSG(DiscordCH, to, json)
        .then(x=> pushReport(DiscordCH, x));
    }
  }
  function textMessage (DiscordCH, id, msg) {
    return switchSend(DiscordCH, id, {
      type: 'text',
      text: T.Zcut(msg, Defaults.MaxText, '...')
    });
  }
  function flexMessage (DiscordCH, id, alt, flex) {
    return switchSend(DiscordCH, id, {
        type: 'flex',
     altText: (alt || '... <N/A>'),
    contents: flex
    });
  }
  async function pushMSG (DiscordCH, to, json) {
    let result;
    await pushMessage(to, json)
    .then(x=> result = { success: true })
    .catch(e=> {
      result = (e.statusCode && e.statusCode == 429)
        ? SetInvalid() : (x=> {
          U.throw(`[LINE:switchSend] push Error:`, e);
          return { error: true };
        })();
    });
    return result;
  }
  function pushReport (DiscordCH, cd) {
    if (cd && ! cd.success) {
      R.Discord.Client().channel_send
        (DiscordCH, 'LINE側に投稿できませんでした。', 5);
    }
  }
  function SetInvalid () {
    U.replys.setInvalid();
    return { invaled: true };
  }
  async function flexMessageStyle (DiscordCH, id, arg) {
    if (! arg.text) return;
    if (/^text\>\s*(.+)/i.exec(arg.text)) {
      return pushMSG(DiscordCH, id, {
        type: 'text',
        text: `🔷 *${arg.userName}* 🔷\n${RegExp.$1}\n📌 _by Discord_`
      }).then(x=> pushReport(x));
    }
    let result;
    await FlexStyle.create
      (U, arg).then(x=> result = x);
    return flexMessage(DiscordCH, id, ...result)
      .then(x=> pushReport(DiscordCH, x));
  }
  let BOX;
  async function getProfile (type, id, from) {
    if (! type || ! id || ! from)
        U.throw(`[LINE] getProfile: Incomplete argument.`);
    await R.box.line(id).get().then(d=> BOX = d);
    if (BOX.hasNew() || BOX.get('refreshTTL') < T.unix()) {
      await $setupData_(type, id, from);
    }
    BOX.util().inc('countPost')
       .util().setDefault('tmLastPost')
       .prepar();
    return BOX.Reference();
  }
  async function $setupData_ (type, id, from) {
    let PF;
    await profileFromLine(type, id, from).then(x=> PF = x);
    BOX.set('name',    (PF.displayName || '(N/A)'))
       .set('iconURL', (PF.pictureUrl  || ''))
       .set('orign',    PF)
       .set('refreshTTL', T.unix_add(RefreshTTL, 'm'));
    return true;
  }
  function profileFromLine (type, id, from) {
    return new Promise( resolve => {
      let Func;
      switch (type) {
        case 'user':
          Func = () => { return U.client().getProfile(id) };
          break;
        case 'group':
          Func = () =>
          { return U.client().getGroupMemberProfile(from, id) };
          break;
        case 'room':
          Func = () =>
          { return U.client().getRoomMemberProfile(from, id) };
          break;
        default:
          return resolve({ failed: true });
      }
      Func().then(x=> resolve(x)).catch(e=> {
        U.tr(`[LINE:profileFromLine] result:`, e);
        resolve({ failed: true });
      });
    });
  }
}
function REPLYS (U) {
  const Se = this,
  DATA = U.Ref.replys || (x=> {
    return (U.Ref.replys = { list: {}, invalid: false });
  })();
  Se.get = GET;
  Se.set = SET;
  Se.setInvalid = setINVALID;
  Se.hasInvalid = hasINVALID;
  //
  function GET (chID) {
    let X;
    if (X = TOKENS(chID).shift()) return X.token;
    if (X = DATA.invalid) {
      if (X == MonthNow()) return false;
      DATA.invalid = false;
    }
    return false;
  }
  function hasINVALID () {
    return DATA.invalid ? true: false;
  }
  function setINVALID () {
    DATA.invalid = MonthNow();
    return Se;
  }
  function SET (chID, postTime, token) {
    const Tokens = LISTDATA(chID);
    Tokens.push({
      token: token,
        ttl: (postTime + 29500) // see LINE messageAPI.
    });
    return Se;
  }
  function LISTDATA (chID) {
    return DATA.list[chID] || (DATA.list[chID] = []);
  }
  function TOKENS (chID) {
    const Now = U.tool.utc(),
      NewData = [];
    for (let data of Object.values(LISTDATA(chID))) {
      if (data.ttl < Now) continue;
      NewData.push(data);
    }
    return (DATA.list[chID] = NewData);
  }
  function MonthNow () {
    return U.tool.time_form('MM');
  }
}
