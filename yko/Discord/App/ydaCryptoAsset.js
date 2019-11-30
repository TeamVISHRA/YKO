'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ydaCreptoAsset.js';
const ver = `${my} v191030`;
//
module.exports.Unit = function (P) {
  const R = P.root;
  const U = P.unitKit('asset', this, P),
        T = P.tool,
      Liq = R.Liquid;
  U.ver = ver;
  U.run = RUN;
  //
  function RUN (crum) {
    if (! P.isDM()) P.delete();
    const i = T.A2a(crum);
    if (/^now\s*([^\s]*)/.exec(i)) {
      NOW(RegExp.$1);
    } else if (/^regist\s*/i.test(i)) {
      REGIST();
    } else if (/^ok\s*([^\s]*)/i.test(i)) {
      OK(RegExp.$1);
    } else {
      HELP();
    }
  }
  async function NOW (symbol) {
    let is = checkCHallow('now');
    if (is.result) return RESULT(is.result);
    const Lp = Liq.Products();
    const Cash = Liq.Ref.reports || {};
    let Prods = [];
    if (symbol) {
      symbol = symbol.toUpperCase();
      if (! Lp[symbol]) {
        if (! Lp[`${symbol}JPY`]) return RESULT('unnown_symbol');
        symbol += 'JPY';
      }
      await Liq.pickPrice(symbol).then(x=> {
        Prods.push
        ({ symbol: symbol, cash: Cash[symbol], result: x });
      });
    } else {
      for (let prod of T.k(Lp)) {
        await Liq.pickPrice(prod).then(x=> {
          Prods.push
          ({ symbol: prod, cash: Cash[prod], result: x });
        });
      }
    }
    if (Prods.length < 1) return RESULT('unnown_result');
    return P.send
    ({ embed: createEmbed(Prods) }, 60).then(x=> R.away());
  }
  async function checkRegist () {
    let is = checkCHallow('reg');
    if (is.result) return is;
    await registRoleAllow().then(x=> is = x);
    if (is.allow) is.result = is.allow;
    return is;
  }
  async function REGIST () {
    let is; await checkRegist().then(x=> is = x);
    if (is.result) return RESULT(is.result);
    await R.box.cash().get(cashKey()).then(x=> is = x);
    const old = (is.has('registCode') ? true: false),
         code = T.makeTicket();
    is.set('registCode', code).prepar();
    const msg = messages('completeRegist', { code: code });
    return P.reply(msg, 120).then(x=> R.finish());
  }
  async function OK (registCode) {
    if (! registCode) return RESULT('unknownCode');
    let is; await checkRegist().then(x=> is = x);
    if (is.result) return RESULT(is.result);
    await R.box.cash().get(cashKey()).then(x=> is = x);
    if (is.hasNew()) return RESULT('registPls');
    if (is.get('registCode') != registCode) return RESULT('unmatch');
    P.member().addRole(U.conf.lawRole);
    P.memberNow().resetCash().prepar();
    is.DataRemove();
    const ch = P.channelGET(U.conf.channel);
    const msg = messages('completeOK', { name: ch.name });
    return P.reply(msg, 20).then(x=> R.finish());
  }
  function HELP () {
    P.send({ embed: {
      title: '暗号資産情報機能のヘルプ',
      color: 0x0083FC, fields: [
      { name: `${PF()}now [symbol]`,
        value: '`・最新の相場情報を取得。`' },
    ]	} }, 60);
    R.away();
  }
  function cashKey () {
    return `DISCORD-${P.guildID()}-${P.userID()}-ASSET-REGIST`;
  }
  function createEmbed (list) {
    const Fields = [];
    const Alerts = [];
    for (let v of list) {
      const Price = T.Floor(v.result.last_traded_price, 1000);
      Fields.push({
        name: `> ${v.symbol}`,
       value: `${v.result.base_currency}`
            + `- ${Price} (${v.result.currency})`
      });
      if (v.cash) {
        const res = v.cash.res;
        Alerts.push(`${v.symbol}(${res.rateHigh}/${res.rateLow})`);
      }
    }
    const Embed = {
      title: `暗号資産 - 現在相場`,
      color: 0x86f607,
      fields: Fields,
      timestamp: new Date ()
    };
    if (Alerts.length > 0) {
      const text = Alerts.join('\n');
      Embed.footer = { text: `Alert>\n${text}\n` };
    }
    return Embed;
  }
  async function registRoleAllow () {
    return await P.memberNow().then(x=> {
      const roles = x.getRoles();
      if (roles[U.conf.lawRole]) return { allow: 'roleAllow' };
      for (let v of T.v(P.conf.roles)) {
        const has = roles[v.id];
        if (has && v.okAsset) return has;
      }
      return { result: 'roleDeny' };
    });
  }
  function checkCHallow (type) {
    if (P.isDM()) return { result: 'bad_dm' };
    if (U.debug()) return {};
    if (type == 'reg') {
      return U.conf.registCH == P.channelID()
             ? {}: { result: 'bad_registChannel' };
    } else {
      return Liq.targetDiscordCH() == P.channelID()
             ? {}: { result: 'bad_channel' };
    }
  }
  function RESULT (key) {
    return P.reply(messages(key), 5).then(x=> R.away());
  }
  function messages (key, arg) {
    const Messages = {
bad_dm:
`要求のコマンドは、ダイレクト・メッセージから受け付けられません。`,
bad_channel:
`要求のコマンドは、専用のチャンネルでしか受け付けられません。`,
bad_registChannel:
`要求のコマンドは、案内されているチャンネルからしか受け付けられません。`,
roleAllow:
`既に必要な権限が設定されているようです。 regist は必要ありません。`,
roleDeny:
`必須な識別権限が貴方に割り当てられていません。管理者に問い合わせて下さい。`,
registPls:
`時間切れ等により登録コードが不明。再度、${PF()}regist を発行して下さい。`,
unmatch:
`登録コードが一致しません。再度、${PF()}regist を発行して下さい。`,
unknownCode:
`登録コードの指定がありません。`,
unnown_symbol:
`不明な銘柄が指定されています。`,
unnown_result:
`何らかの異常で、データを取得出来ませんでした。`
    };
    Messages.completeRegist = () => {
      let result = `下記の同意事項に必ず目を通して下さい。
\`\`\`
【同意事項】
本コミュニティからの情報について、その内容一切を保証しません。
従って、実際に投資等を行う際は、必ず自己責任で行って頂く事が前提となります。
\`\`\`
> 下記のコマンドで登録手続きを完了します。

${PF()}asset OK ${arg.code}

\`:warning: 送信と同時に「同意事項」に承諾したものとして扱います。\`
`;
      if (arg.old) result += `\`\`\`
💥以前に発行した登録コードは無効になっています。
　必ず、上記コマンドのコードを使用して下さい。
\`\`\``;
      return result;
    };
    Messages.completeOK = () => {
      return `
#${arg.name} を閲覧できるようになりました。

#${arg.name} で、${PF()}now とすると、対応銘柄の最新情報を表示します。
`;
    };
    return T.isFunction
      (Messages[key]) ? Messages[key](): Messages[key];
  }
  function PF () {
    return R.brain.prefix();
  }
}
