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
    return U.replys.hasInvalid()
      ? false: U.client().pushMessage(id, json);
  }
  async function switchSend (to, json) {
    const Token = U.replys.get(to);
    if (Token) {
      return replyMessage(Token, json).catch(e=> {
        if (e.statusCode) {
          if (e.statusCode == 400) {
            return switchSend(to, json);
          } else if (e.statusCode == 429) {
            return SetInvalid();
          }
        }
        pushMSG().catch
        (e=> { U.throw(`[LINE:switchSend] push Error:`, e) });
      });
    } else {
      pushMSG();
    }
    async function pushMSG () {
      return pushMessage(to, json).catch(e=> {
        if (e.statusCode && e.statusCode == 429) return SetInvalid();
        U.throw(`[LINE:switchSend] push Error:`, e);
      });
    }
  }
  function SetInvalid () {
    U.replys.setInvalid();
    return false;
  }
  function textMessage (id, msg) {
    return switchSend(id, {
      type: 'text',
      text: T.Zcut(msg, Defaults.MaxText, '...')
    });
  }
  function flexMessage (id, alt, flex) {
    return switchSend(id, {
        type: 'flex',
     altText: (alt || '... <N/A>'),
    contents: flex
    });
  }
  async function flexMessageStyle (id, arg) {
    if (! arg.text) return;
    if (/^text\>\s*(.+)/i.exec(arg.text)) {
      return pushMessage(id,
      `🔷 *${arg.userName}* 🔷\n${RegExp.$1}\n📌 _by Discord_`
      );
    }
    let result;
    await FlexStyle.create(U, arg).then(x=> result = x);
    return flexMessage(id, ...result);
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
