//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ycDiscordRSSroom.js';
const ver = `yko/CRON/${my} v191013.01`;
//
const FeedParser = require('feedparser');
const request    = require('request');
//
module.exports.Unit = function (P) {
  const S = P.root.unitKit('job_RSS', this, 0, P.conf);
    S.ver = ver;
  const T = S.tool,
        R = S.root,
     KEYS = S.un.im.sysDataKey,
      DBG = S.un.im.discord.devel;
  let DEBUG, DBGCH;
  if (S.debug()) {
    DEBUG = (id) => { return id == DBG.guild ? true : false };
    DBGCH = () => { return DBG.channel };
  } else {
    DEBUG = () => { return true };
    DBGCH = (ch) => { return ch };
  }
  S.run = async () => {
    let Discord;
    await R.sysDB().get('discord').then(x=> Discord = x);
    S.tr5('run - sysDB', Discord);
    for (let [id, G] of T.e(Discord.guilds)) {
      if (! G.CRON || ! DEBUG(id)) continue;
      S.tr3('run - guild id', id);
      let C = G.CRON.RSSreader;
      if (! C || ! C.toCH
        || ! C.sites || C.sites.length < 1) continue;
      S.tr3('run:for - guild id', id);
      S.tr3('run:for - to channel', C.toCH);
      S.tr5('run:for - RSS sites', C.sites);
      C.id = id;
      C.dbKey = {
        id: R.Discord.buildDataID(id),
        name: '_CRON_RSS_READER__'
      };
      return S.RSS(C);
    }
  };
  S.RSS = async (C) => {
    S.tr5('RSS:C = ', C);
    let BOX;
    await R.box.any('cron', C.dbKey).then(x=> BOX = x );
    let historys = BOX.isNew() ? [] : BOX.get('historys');
    const rssGet = new Promise( rsv => {
      let [count, rssNow] = [0, []];
      for (let rss of C.sites) {
        let Err = false;
        let req = request(rss.url);
        let fp  = new FeedParser({});
        let no  = 0;
        req.on('error', function (err) {
          S.tr(err);
        });
        req.on('response', function (res) {
          let self = this;
          if (res.statusCode == 200) {
            self.pipe(fp);
          } else {
            S.tr('Responce Status: '
              + (res.statusCode || 'No response'), rss.url );
          }
        });
        fp.on('readable', function () {
          while(i = this.read()) {
            let lwTitle =
              T.Zcut(i.title, S.conf.title.low);
            let edTitle =
              T.Zcut(i.title, S.conf.title.edit, '...');
            S.tr5('RSS - parse', edTitle);
            rssNow.push({
              no: ++no,
              url: i.link,
              lowTitle: lwTitle,
              editTitle: edTitle
            });
          }
        });
        fp.on('end', function () {
          if (++count >= C.sites.length) rsv(rssNow);
        });
      }
    });
    rssGet.then( rssNow => {
      rssNow.sort((a, b) => {
        if (a.no < b.no) return -1;
        if (a.no > b.no) return  1;
        return 0;
      });
      let output;
      for (let i of rssNow) {
        if ( historys.find(o => o.url == i.url)
          || historys.find(o => o.title == i.lowTitle)) {
          continue;
        }
        output = { title: i.editTitle, url: i.url };
        historys.push({
          time : T.unix(),
          itle : i.lowTitle,
          url  : i.url
        });
        break;
      }
      if (output) {
        BOX.set('historys',
              T.array2cut(historys, S.conf.history.size) );
        S.tr2('RSS:output - history size', historys.length);
        S.tr2('RSS:output - send ch', C.toCH);
        const SEND = (o) =>
        { R.Discord.Client().channel_send(DBGCH(C.toCH), o) };
        R.web.get(output.url).then( bd => {
          const og = bd.ogp();
          let url = bd.pageURL() || output.url;
          if (bd.invalid() || bd.char() == 'UTF32') {
            SEND(`.\n${url}`);
          } else {
            let embed = {
              title: output.title,
              url  : url,
              color: 0x9d9d9d,
              description: '',
              timestamp: new Date()
            };
            let tmp;
            if (tmp = bd.pageImage()) {
              embed.image = { url: tmp };
            }
            if (tmp = bd.pageSiteName()) {
              embed.description = `\`< ${tmp} >\`\n`;
            }
            embed.description += bd.pageDescription();
            if (tmp = bd.pageKeywords()) {
              embed.footer = { text: tmp };
            }
            SEND({ embed: embed });
          }
          BOX.preper();
          R.finish();
        });
      } else {
        S.tr2('_RSS_:output - (There are no new arrivals.)');
        R.finish();
      }
    });
  };
}
