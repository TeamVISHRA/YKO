'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'yLINE.js';
const ver = `yko/${my} v191102`;
//
const LINE = require('@line/bot-sdk');
//
let STATE = 'Normal';
const ImageStick = {
  S: '/iPhone/sticker_key.png',
  L: '/iPhone/sticker_key@2x.png'
};
const BaseStick =
'https://stickershop.line-scdn.net/stickershop/v1/sticker/';
//
module.exports.Super = function (Y, Ref) {
  Y.throw(`[LINE] ${my}`, 'Cannot operate with Super.');
}
module.exports.Unit = function (R, Ref) {
  const U = R.unitKit('line', this, R, Ref);
  U.ver = `${ver} :U`;
  Ref.$unit(U);
  build_unit_comps(U);
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
function build_unit_comps (U) {
  const R = U.root, T = U.tool;
  U.send = (id, msg) => {
    U.client()
     .pushMessage(id, { type: 'text', text: msg });
  };
  U.stamp = (sID, size) => {
    return
    `${BaseStick}${sID}${ImageStick[(size || 'L')]}`;
  };
  U.getProfile = async (WH, su) => {
    let prof, conf;
    if (prof = R.procCash().get(su.userId)) return prof;
    switch (su.type) {
      case 'group':
        if (conf = WH[su.groupId]) {
          await U.client().getGroupMemberProfile
          (su.groupId, su.userId).then(p=> prof = p );
        }
        break;
      case 'user':
        if (conf = WH[su.userId]) {
          await U.client()
          .getProfile(su.userId).then(p=> prof = p );
        }
        break;
      case 'room':
        if (conf = WH[su.roomId]) {
          await U.client().getRoomMemberProfile
          (su.roomId, su.userId).then(p=> prof = p );
        }
        break;
    }
    return R.procCash().set(su.userId,
        ((conf && prof) ? T.a(prof, conf): {}));
  };
  U.WH = async (yH, token) => {
    U.tr3('[Line] WH');
    const WH = U.conf.TYPE.WH[token];
    if (! WH) return { success: false };
    let Body;
    await yH.parseBODY().then(bd=> {
      Body = (bd.data
           && bd.data.length > 10) ? bd.data : '';
    }).catch(e=> {});
    if (! Body) {
      if (! R.finished()) {
        U.tr3('[Line] Alternative for debugging');
        await yH.parsePOST()
          .then(o => { if (o.$json) Body = o.$json })
          .catch(e=> {});
        U.tr3('[Line] Capture data by POST');
      }
      if (! Body) return { success: false };
    }
    const json = T.txt2json(Body);
    if (json.events) {
      json.$COUNT = 0;
      for (let v of T.v(json.events)) {
        let tmp;
        switch (v.type) {
          case 'message':
            await U.eventMessage(WH, v)
              .then(x=> tmp = x).catch(e=> U.throw(e));
            break;
          default:
            U.saveLog(json);
            break;
        }
        ++json.$COUNT;
      }
    } else { U.saveLog(json) }
    return { success: (json.$COUNT ? true: false) };
  };
  U.eventMessage = async (WH, j) => {
    const ms = j.message;
    let Po;
    await U.getProfile(WH, j.source)
           .then(po=> Po = po ).catch(e=> U.throw(e));
    if (! Po || ! Po.displayName || ! Po.toDiscord) {
      U.saveLog(j);
      return false;
    }
    const msg = ms.type == 'sticker'
        ? U.stamp(ms.stickerId, 'L')
        : (T.Zcut(ms.text, 1000, '...') || '.....');
    U.toDiscord(Po.toDiscord, Po.displayName, msg);
    return true;
  };
  U.saveLog = (json) => {
    const conf = R.box.conf.log;
    R.box.cash({ name: `LINE-${T.unix()}.${T.counter()}`,
        ...conf.keys }).then( BOX => {
      BOX.TTL = conf.TTL;
      BOX.set('title', 'LINE:Log');
      BOX.set('data', (T.json2txt(json) || json));
      BOX.prepar();
      R.box.commit();
    }).catch(e=> U.throw(e));
    return true;
  };
}
function build_guest_comps (G) {
  if (! G.conf.CHtoken)
      G.throw(`[Line] '<conf>.CHtoken' setting is empty.`);
  if (! G.conf.CHsecret)
      G.throw(`[Line] '<conf>.CHtoken' setting is empty.`);
  let MoreComp;
  if (G.rack.has('Discord')) {
    let WHWRAP;
    if (G.debug()) {
//      const wh = G.discord.devel.webhook;
//      WHWRAP = (to) => { return [wh.id, wh.token] };
    } else {
//      WHWRAP = (to) => { return [to.id, to.token] };
    }
    MoreComp = U => {
      U.toDiscord = async (to, name, msg) => {
        if (to.DM) {
          U.root.Discord.Client()
          .DMsend(to.DM, `✅**${name}**： ${msg} - \`Line\``);
        } else {
          U.root.Discord.webhook
            (WHWRAP(to), `✅**${name}**： ${msg} - \`Line\``);
        }
      };
    };
  } else {
    MoreComp = U => {
      U.toDiscord = async () => {};
    };
  }
  let Client;
  G.Ref.$unit = U => {
    U.client = () => {
      return Client || (Client = new LINE.Client ({
  channelAccessToken: G.im.CHtoken,
       channelSecret: G.im.CHsecret
      }));
    };
    MoreComp(U);
  };
}
