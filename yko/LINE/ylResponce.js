'use strict';
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ylResponce.js';
const ver = `yko/${my} v191108`;
//
const ImageStamp = {
  S: '/iPhone/sticker_key.png',
  L: '/iPhone/sticker_key@2x.png'
};
const BaseStamp =
  'https://stickershop.line-scdn.net/stickershop/v1/sticker/';
//
let T;
module.exports.toDiscord = function (P) {
  const R = P.root;
  const U = R.unitKit('responce', this, P);
        T = U.tool;
  U.toDiscord = toDiscord;
  //
  function toDiscord (Type, From, User, json) {
    return new Promise (async resolve => {
      let msg;
      if (! Type || ! From || ! User) {
        U.tr(msg = `[toDiscord] Incomplete argument.`);
        return $warning_
          ({ ...json, error: msg }).then(x=> resolve(x));
      }
      if (/^([A-Za-z0-9])\1+$/.test(json.replyToken)) {
        return $warning_(json).then(x=> resolve(x));
      }
      const CF = U.conf.froms[From] || U.conf.froms.default;
      let PF;
      await P.getProfile
          (json.source.type, User, From).then(x=> PF = x);
      if ($hasFailed_(PF))
          return $warning_(json).then(x=> resolve(x));
      switch (Type) {
        case 'text':
          msg = makeTextMessage(PF, json.message);
          break;
        case 'sticker':
          msg = makeStickerMessage(PF, json.message);
          break;
        case 'image':
          msg = makeMediaMessage(PF, json.message);
          break;
        case 'video':
          msg = makeMediaMessage(PF, json.message);
          break;
        case 'audio':
          msg = makeMediaMessage(PF, json.message);
          break;
      }
      if (! msg) return $warning_(json).then(x=> resolve(x));
      if (CF.toUserID) {
        return R.Discord.Client().DMsend
          (CF.toUserID, msg).then(x=> resolve(200));
      } else if (CF.toChannelID) {
        return R.Discord.Client().channel_send
          (CF.toChannelID, msg).then(x=> resolve(200));
      } else if (CF.toWebhook) {
        return R.Discord.webhook
          (CF.webhook, msg).then(x=> resolve(200));
      } else {
        U.tr(msg = `[Line:toDiscord] There is no setting type.`);
        return $warning_
          ({ ...json, error: msg }).then(x=> resolve(x));
      }
    });
  }
  async function $warning_ (json) {
    let code;
    await P.accept.log('warn', json).then(x=> code = x);
    return code;
  }
  function $hasFailed_ (PF) {
    return PF.value.orign.failed ? true: false;
  }
}
module.exports.unDiscord = function (P) {
  U.toDiscord = async () => { return [0] };
}
function makeTextMessage (PF, json) {
  const msg = T.isString(json) ? json : json.text;
  return { embed: { ...($baseEmbed_(PF)), description: msg } };
}
function makeStickerMessage (PF, json) {
  if (! json.stickerId)
    return makeTextMessage(PF, `Error: 'stickerId' is unknown.`);
  return { embed: {
    ...($baseEmbed_(PF)),
    image: { url: stamp(json.stickerId) }
  } };
  function stamp (id, size) {
    return `${BaseStamp}${id}${ImageStamp[(size || 'L')]}`;
  };
}
function makeMediaMessage (PF, json) {
  let cp = json.contentProvider;
  if (! cp || ! cp.type || cp.type != 'external') return false;
  return { embed: {
    ...($baseEmbed_(PF)),
    image: { url: cp.originalContentUrl }
  } };
}
function $baseEmbed_ (PF) {
  const embed = {
     color: 0x00d455,
    author: { name: PF.name },
    footer: { text: 'From LINE' }
  };
  if (PF.iconURL) embed.author.icon_url = PF.iconURL;
  return embed;
}
