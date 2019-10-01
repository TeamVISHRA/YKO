//
// yko/CRON/ycDiscordRSSroom.js
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ycDiscordRSSroom.js';
const ver = `yko/CRON/${my} v190929.01`;
//
const FeedParser = require('feedparser');
const request = require('request');
//
module.exports = function (Y, P, args) {
  this.ver = ver;
	const S = this;
	S.conf = P.conf.job_RSS;
	const KEYS = Y.im.sysDataKey;
  const DBG = Y.im.discord.devel;
	let DEBUG, DBGCH;
  if (Y.debug()) {
    DEBUG = (id) => { return id == DBG.guild ? true : false };
    DBGCH = () => { return DBG.channel };
  } else {
    DEBUG = () => { return true };
    DBGCH = (ch) => { return ch };
  }
	S.run = async (X, label) => {
    let Discord;
    await X.sysDATA.noCash(['discord'])
                   .then( db => { Discord = db.value });
    Y.tr5('run - sysDATA', Discord);
		for (let [id, G] of Object.entries(Discord.guilds)) {
			if (! G.CRON || ! DEBUG(id)) continue;
      Y.tr2('run - guild id', id);
			let C = G.CRON.RSSreader;
			if (! C || ! C.toCH
						  || ! C.sites || C.sites.length < 1) continue;
      Y.tr2('run:for - guild id', id);
      Y.tr2('run:for - to channel', C.toCH);
      Y.tr4('run:for - RSS sites', C.sites);
			C.id = id;
			C.dbKey = {
				id: X.Discord.buildDataID(id),
				name: '_CRON_RSS_READER__'
			};
			return S._RSS_(X, C, label);
		}
	};
	S._RSS_ = async (X, C, label) => {
    Y.tr5('_RSS_:C = ', C);
		const T = Y.tool;
		let BOX;
		await X.box.any('cron', C.dbKey).then( box => { BOX = box });
		let historys = BOX.isNew() ? [] : BOX.get('historys');
		const rssGet = new Promise( rsv => {
			let [count, rssNow] = [0, []];
			for (let rss of C.sites) {
        let Err = false;
				let req = request(rss.url);
				let fp  = new FeedParser({});
				let no  = 0;
				req.on('error', function (err) {
          Y.tr(err);
        });
				req.on('response', function (res) {
					let self = this;
					if (res.statusCode == 200) {
            self.pipe(fp);
          } else {
            Y.tr('Responce Status: '
              + (res.statusCode || 'No response'), rss.url );
          }
				});
				fp.on('readable', function () {
					while(i = this.read()) {
						let lwTitle =
								T.Zcut(i.title, S.conf.title.low);
						let edTitle =
								T.Zcut(i.title, S.conf.title.edit, '...');
            Y.tr5('_RSS_ - parse', edTitle);
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
          time : T.time_u(),
          itle : i.lowTitle,
          url  : i.url
        });
				break;
			}
      if (output) {
				BOX.set('historys',
              T.array2cut(historys, S.conf.history.size) );
        Y.tr2('_RSS_:output - history size', historys.length);
        Y.tr2('_RSS_:output - send ch', C.toCH);
        const SEND = (o) =>
        { Y.Discord.Client().channel_send(DBGCH(C.toCH), o) };
        X.web().get(output.url).then( bd => {
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
          X.finish();
        });
			} else {
        Y.tr2('_RSS_:output - (There are no new arrivals.)');
			  X.finish();
      }
		});
	};
}
