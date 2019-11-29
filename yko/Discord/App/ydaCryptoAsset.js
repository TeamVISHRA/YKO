'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ydaCreptoAsset.js';
const ver = `${my} v191029`;
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
    if (/^now\s*([^\s]*)/.test(i)) {
      NOW(RegExp.$1);
    } else {
      HELP();
    }
  }
  async function NOW (symbol) {
    if (! checkCHallow()) return RESULT('bad_channel');
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
    ({ embed: createEmbed(Prods) }, 120).then(x=> R.away());
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
  function checkCHallow () {
    if (U.debug()) return true;
    return (! P.isDM() &&
    Liq.targetDiscordCH() == P.channelID()) ? true: false;
  }
  function RESULT (key) {
    return P.reply(messages(key), 5).then(x=> R.away());
  }
  function messages (key) {
    return {
      bad_channel:
      `要求のコマンドは、専用のチャンネルでしか受け付けられません。`,
      unnown_symbol:
      `不明な銘柄が指定されています。`,
      unnown_result:
      `何らかの異常で、データを取得出来ませんでした。`
    }[key];
  }
  function PF () {
    return R.brain.prefix();
  }
}
