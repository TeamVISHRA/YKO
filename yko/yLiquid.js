'use strict';
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'yLiquid.js';
const ver = `yko/${my} v191202`;
//
module.exports.Super = function (Y, Ref) {
  Y.throw(`[Liquid] ${my}`, 'Cannot operate with Super.');
}
module.exports.Unit = function (R, Ref) {
  const U = R.unitKit('liquid', this, R, Ref);
  U.ver = `${ver} :U`;
  Ref.$unit(U);
}
module.exports.init = function (Y, Ref) {
  const G = Y.superKit('liquid', this, Y, Ref);
  G.ver = `${ver} :G`;
  build_guest_comps(G);
}
module.exports.initFake = function (Y, Ref) {
}
function build_guest_comps (G) {
  G.Ref.$unit = build_unit_comps;
}
function build_unit_comps (U) {
  const R = U.root,
        T = U.tool;
         U.report = Report;
      U.appendPar = appendPar;
      U.pickPrice = pickPrice;
   U.pickProducts = pickProducts;
U.targetDiscordCH = targetDiscordCH;
       U.Products = Products;
       U.tradeBox = tradeBox;
  //
  async function Report () {
    const Cash = U.Ref.notice || (U.Ref.notice = {});
    for (let [prod, v] of T.e(Products())) {
      let json; await appendPar(prod).then(x=> json = x);
      if (! json) continue;
      const PriceNow = priceNow_(json);
      if (! PriceNow) continue;
      if (! Cash[prod]) {
        initNotice_(prod, v, PriceNow);
        continue;
      }
      let RES;
      await noticeLow(prod).findOne
        ({ price: { $lt: PriceNow } }).then(x=> RES = x);
      if (RES._id()) return sendNoticeLow(RES, v, json);
      await noticeHigh(prod).findOne
        ({ price: { $gt: PriceNow } }).then(x=> RES = x);
      if (RES._id()) return sendNoticeHigh(RES, v, json);
      return {};
    }
    function sendNoticeLow (RES, v, json) {
      const PriceNow = priceNow_(json);
      const diff = T.Floor((PriceNow - RES.get('oldPrice')), 1000);
      toDiscord(makeNoticeEmbed(RES, v, json, {
        color: 0xfe0035,
        title: `${makeSymbol(json)} 🔻${diff}`,
        description: `【 価格 - 下降中 】`
      }));
      return initNotice_(RES.get('product'), cf, json);
    }
    function sendNoticeHigh (RES, v, json) {
      const PriceNow = priceNow_(json);
      const diff = T.Floor((RES.get('oldPrice') - PriceNow), 1000);
      toDiscord(makeNoticeEmbed(RES, v, json, {
        color: 0x005eff,
        title: `${makeSymbol(json)} 🔼${diff}`,
        description: `【 価格 - 上昇中 】`
      }));
      return initNotice_(RES.get('product'), cf, json);
    }
    function makeNoticeEmbed (RES, v, json) {
      const priceNow = T.Floor(priceNow_(json), 1000);
      const priceOld = T.Floor(RES.get('oldPrice'), 1000);
      const embed = {
          url: v.chart,
       fields: [ {
       name: RES.get('timeForm'),
      value: `${priceOld} (${json.currency})`
        } ],
        timestamp: new Date (),
        ...embed
      };
      embed.description +=
          `\n現在値： ${priceNow} (${json.currency})`;
      return embed;
    }
    function makeSymbol () {
      return `${json.base_currency}/${json.currency}`;
    }
    function priceNow_ (json) {
      return json.last_traded_price;
    }
    async function initNotice_ (prod, cf, json) {
      const Price = priceNow_(json);
      const Rate = cf.rate || Public().report.rate || 0.015;
      const Low = T.Floor((Price* (1 - Rate)), 1000),
           High = T.Floor((Price* (1 + Rate)), 1000);
      Cash[prod] = { res: { rateLow: Low, rateHigh: High } };
      U.tr3(`[Liquid] initReport: ${Price} (${High}/${Low})`);
      return await setNotice(prod, 'low',  Low,  json)
         .then(x=> setNotice(prod, 'high', High, json) );
    }
    async function setNotice (prod, type, value, json) {
      return (type == 'low' ? noticeLow(prod): noticeHigh(prod))
        .get().then(box=> {
        box.set('price', value)
           .set('status', 'active')
           .set('currency', json.currency)
           .set('oldPrice', Price)
           .set('timeForm', T.time_form(0, `/DD HH:MM`))
           .prepar();
        return box;
      });
    }
  }
  function toDiscord (embed) {
    return R.Discord.Client().channel_send
        (targetDiscordCH(), { embed: embed });
  }
  function noticeLow (prod) {
    return tradeBox(`system.${prod}.notice.low`);
  }
  function noticeHigh (prod) {
    return tradeBox(`system.${prod}.notice.high`);
  }
  function tradeBox (key) {
    return R.box.assetTrade(key);
  }
  function Public () {
    return U.conf.public;
  }
  function Products () {
    return Public().products;
  }
  function targetDiscordCH () {
    return Public().report.toDiscordCH;
  }
  async function appendPar (prod) {
    let json; await pickPrice(prod).then(x=> json = x);
    if (! json) {
      U.tr(`[Liquid] (${prod}) Failed to get data.`);
      return {};
    }
    const DT = {};
    [DT.year, DT.month, DT.day, DT.hour, DT.minute] =
          T.time_form(0, 'YYYY.MM.DD.HH.mm').split('.');
    R.box.asset('par').append({ ...DT,
     product: prod,
     highAsk: json.high_market_ask,
         Ask: json.market_ask,
         Bid: json.market_bid,
      lowBid: json.low_market_bid,
       price: json.last_traded_price,
      symbol: (json.base_currency || json.symbol || 'N/A'),
    currency: json.currency,
//       orign: json
    });
    return json;
  }
  async function pickProducts () {
    return await R.web.get
      (U.conf.public.URL).then(x=> { return x.jsonBody });
  }
  async function pickPrice (prod) {
    const Pcode = Products()[prod] ||
                  U.throw(`[Liquid] product is unknown.`);
    const URL = `${Public().URL}${Pcode.code}`;
    U.tr3(`[Liquid] request:`, URL);
    return await R.web.get(URL).then(x=> { return x.jsonBody() });
  }
}
