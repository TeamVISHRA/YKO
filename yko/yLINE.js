'use strict';
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'yLINE.js';
const ver = `yko/${my} v191114`;
//
 const SDK = require('@line/bot-sdk'),
    Accept = require('./LINE/ylAccept.js'),
  Responce = require('./LINE/ylResponce.js'),
 FlexStyle = require('./LINE/ylFlexStyle.js'),
RefreshTTL = 12* 60, // minute.
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
  if (! CF.CHtoken || ! CF.CHsecret)
      G.throw(`[Line] Need to check configuration.`);
  //
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
          U.sayText = sayText,
          U.sayFlex = sayFlex;
     U.sayFlexStyle = sayFlexStyle;
       U.getProfile = getProfile;
  U.profileFromLine = profileFromLine;
  //
  function sayText (id, msg) {
    U.tr3(`[LINE] sayText:`, id, msg);
    return U.client().pushMessage(id, {
      type: 'text',
      text: T.Zcut(msg, Defaults.MaxText, '...')
    });
  }
  function sayFlex (id, alt, flex) {
    U.tr4(`[LINE] sayFlex:`, id, flex);
    return U.client().pushMessage(id, {
        type: 'flex',
     altText: (alt || '... <N/A>'),
    contents: flex
    });
  }
  async function sayFlexStyle (id, arg) {
    if (! arg.text) return;
    if (/^text\>\s*(.+)/i.exec(arg.text)) {
      return sayText(id, `🔷 *${arg.userName}* 🔷`
            + `\n${RegExp.$1}\n📌 _by Discord_`);
    }
    let result;
    await FlexStyle.create(U, arg).then(x=> result = x);
    return sayFlex(id, ...result);
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
