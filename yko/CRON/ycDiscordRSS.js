//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ycDiscordRSS.js';
const ver = `yko/CRON/${my} v191025`;
//
module.exports.Unit = function (P) {
  const R = P.root;
  const S = R.unitKit('job_RSS', this, P);
    S.ver = ver;
  const T = S.tool;
  const DBGCH = S.debug()
      ? ()   => { return R.Discord.conf.devel.channel }
      : (ch) => { return ch };
  S.run = async () => {
    for (let Gid of R.Discord.ask.guilds()) {
      let Ds; await R.sysDB(`Discord.${Gid}`)
                .cash('CRON.RSSreader').then(x=> Ds = x);
      S.tr3(`[CRON:RSS] run:sysDB (${Gid})`, Ds);
      if (! Ds || ! Ds.toCH || ! Ds.sites) continue;
      Ds.Gid = Gid;
      const RSS = [];
      for (let v of Ds.sites) { await S.getRSS(v.url, RSS) }
      if (RSS.length < 1) continue;
      await S.output(Ds, T.Sort(RSS));
    }
    R.finish();
  };
  S.output = async (Ds, RSS) => {
    S.tr5('[CRON:RSS] output');
    let BOX; await R.box
    .cash(`ycRSS(${Ds.Gid}:history)`).get().then(x=> BOX = x);
    BOX.TTL = T.unix_add((5 * (24* 60)), 'm');
    let History = BOX.hasNew() ? []: BOX.get('history');
    let OUTPUT  = getOutput(S, T, RSS, History);
    if (! OUTPUT) {
      S.tr2('[CRON:RSS] output(There are no new arrivals.)');
      return R.box.commit();
    }
    History = T.array2cut(History, S.conf.history.size);
    BOX.set('history', History).prepar();
    S.tr3(`[CRON:RSS] output:CH(${Ds.toCH})`);
    const SEND = (o) =>
    { R.Discord.Client().channel_send(DBGCH(Ds.toCH), o) };
    R.web.get(OUTPUT.url).then( W => {
      const og = W.ogp();
      OUTPUT.url = W.pageURL() || OUTPUT.url;
      if (W.invalid() || W.char() == 'UTF32') {
        return SEND(`.\n${OUTPUT.url}`);
      } else {
        let embed = {
          title: OUTPUT.title,
          url  : OUTPUT.url,
          color: 0x9d9d9d,
          description: '',
          timestamp: new Date()
        };
        const Image = W.pageImage(),
           SiteName = W.pageSiteName(),
           PageText = W.pageDescription(),
           Keywords = W.pageKeywords();
        if (Image)
            embed.image = { url: Image };
        if (SiteName)
            embed.description = `\`< ${SiteName} >\`\n`;
        if (PageText)
            embed.description += T.Zcut(PageText, 400, '...');
        if (Keywords)
            embed.footer = { text: Keywords };
        return SEND({ embed: embed });
      }
    }).then(x=> R.box.commit() );
  };
  S.getRSS = async (URL, RSS) => {
    let res, no = 0;
    await R.web.cash(URL).then(r=> res = r );
    res.parse($ => {
      let Atom = $('feed').attr();
      const Base =
        (Atom && Atom.xmlns && /Atom/i.test(Atom.xmlns))
            ? $('entry') : $('item');
      Base.each ((i, c) => {
        let Title = $(c).find('title').text();
        let Link = /<link>\s*([^\s<]+)/im.exec($(c).html())
                ? RegExp.$1 : $(c).find('link').attr().href;
        if (Link) {
          let lowTitle = T.Zcut(Title, S.conf.title.low);
                 Title = T.Zcut(Title, S.conf.title.edit, '...');
          RSS.push({
              no: ++no,
             url: Link,
           Title: Title,
        lowTitle: lowTitle
          });
        }
      });
    });
    return S;
  };
}
function getOutput (S, T, RSS, His) {
  let result;
  for (let v of T.v(RSS)) {
    if ( His.find(o => o.url == v.url)
      || His.find(o => o.lowTitle == v.lowTitle)) {
      continue;
    }
    His.push({
      time: T.utc(),
  lowTitle: v.lowTitle,
       url: v.url
    });
    result = { title: v.Title, url: v.url };
    break;
  }
  return result;
}
