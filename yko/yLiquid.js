'use strict';
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'yLiquid.js';
const ver = `yko/${my} v191128`;
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
  //
  async function Report () {
    const Plc = U.conf.public;
    const Cash = U.Ref.reports || (U.Ref.reports = {});
    for (let [prod, v] of T.e(Plc.products)) {
      let json; await appendPar(prod).then(x=> json = x);
      if (! json) continue;
      const PriceNow = priceNow_(json);
      if (! PriceNow) continue;
      const cp = Cash[prod];
      if (! cp) {
        initReport_(prod, v, PriceNow);
        continue;
      }
      let result;
      if (result = cp.high(PriceNow)) {
        toDiscord(reportHigh(result, v, json));
        initReport_(prod, v, PriceNow);
      } else if (result = cp.low(PriceNow)) {
        toDiscord(reportLow(result, v, json));
        initReport_(prod, v, PriceNow);
      }
    }
    function reportHigh (result, v, json) {
      const diff = T.Floor
          ((result.price - priceNow_(json)), 1000);
      return makeReportEmbed(result, v, json, {
        color: 0x005eff,
        title: `${makeSymbol(json)} 🔼${diff}`,
        description: `【 価格 - 上昇中 】`
      });
    }
    function reportLow (result, v, json) {
      const diff = T.Floor
          ((priceNow_(json) - result.price), 1000);
      return makeReportEmbed(result, v, json, {
        color: 0xfe0035,
        title: `${makeSymbol(json)} 🔻${diff}`,
        description: `【 価格 - 下降中 】`
      });
    }
    function makeReportEmbed (res, v, json, base) {
      const priceNow = T.Floor(priceNow_(json), 1000);
      const priceOld = T.Floor(res.price, 1000);
      const embed = {
          url: v.chart,
       fields: [ {
       name: res.timeForm,
      value: `${priceOld} (${json.currency})`
        } ],
        timestamp: new Date (),
        ...embed
      };
      embed.description +=
          `\n現在値： ${priceNow} (${json.currency})`;
      return embed;
    }
    function toDiscord (embed) {
      return R.Discord.Client().channel_send
        (Plc.report.toDiscordCH, { embed: embed });
    }
    function makeSymbol () {
      return `${json.base_currency}/${json.currency}`;
    }
    function priceNow_ (json) {
      return json.last_traded_price;
    }
    function initReport_ (prod, cf, price) {
      const Rate = cf.rate || Plc.report.rate || 0.03;
      const Low = T.Floor((price* (1 - Rate)), 1000),
           High = T.Floor((price* (1 + Rate)), 1000),
             cs = Cash[prod] = { res: {
          price: price,
       timeForm: T.time_form(0, `/DD HH:MM`)
      } };
      U.tr3(`[Liquid] initReport: ${price} (${High}/${Low})`);
      cs.high = (p) => { return p >= High ? cs.res: false };
      cs.low  = (p) => { return p <= Low  ? cs.res: false };
    }
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
      symbol: json.base_currency,
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
    const Plc = U.conf.public;
    const Pcode = Plc.products[prod] ||
        U.throw(`[Liquid] product is unknown.`);
    const URL = `${Plc.URL}${Pcode.code}`;
    U.tr3(`[Liquid] request:`, URL);
    return await R.web.get(URL).then(x=> { return x.jsonBody() });
  }
}
