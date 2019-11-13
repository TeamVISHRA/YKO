//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'WEB.js';
const ver = `yko/${my} v191113`;
//
const metaReg =
  new RegExp(/<meta\s+[^>\n]+charset=([^\"\']+)/im);
const defaultCashTTL = 10;  // minute.
//
module.exports.Unit = function (R, Ref) {
   const S = R.unitKit('web', this, R, Ref);
     S.ver = ver;
   const T = S.tool;
	S.http   = () => { return require('http')  };
	S.https  = () => { return require('https') };
	S.follow = () => { return require('follow-redirects') };
	S.requestPromise = S.request = () =>
									 { return require('request-promise') };
	S.parser = () => { return require('cheerio') };
	//
	S.get = async (o) => {
		S.tr3('get');
		let result;
		await S.getContent(o)
      .then (re=> result = re ).catch(re=> result = re );
		return new HTML (S, result);
	};
  S.head = (URL, callback) => {
		S.tr3('head');
    let [_, ssl, host, port, path] =
      /^http(s)?\:\/\/([^\/\:]+)(\:\d+)?(.*)/.exec(URL);
    const Http = ssl ? S.https() : S.http();
    if (! host) S.throw(`[WEB:head] Unknown host.`);
    if (! port) port = ssl ? 443: 80;
    if (! path) path = '/';
    return new Promise ( resolve => {
      const Req = Http.request({
      method: 'HEAD',
        port: port,
        host: host,
        path: path
      }, responce => resolve(responce));
      Req.end();
    });
  };
  S.cash = async (URL) => {
    let BOX;
    await S.root.box
        .cash(`yWEB:${URL}`).get().then(b=> BOX = b);
    let result;
    if (BOX.hasNew()) {
  		await S.getContent(URL)
      .then(re=> result = re ).catch(re=> result = re );
      BOX.TTL = S.conf.cashTTL || defaultCashTTL;
      result = {
	     invalid: result.invalid,
	        char: result.char,
	        html: result.html,
           res: {
	    httpVersion: result.res.httpVersion,
	     statusCode: result.res.statusCode,
	  statusMessage: result.res.statusMessage,
	    responseUrl: result.res.responseUrl
      } };
      BOX.import(result).prepar();
    } else {
      result = BOX.ref();
    }
    return new HTML (S, result);
  };
	S.getContent = (o) => {
		S.tr1('getContent');
		return new Promise ((resolve, reject) => {
			if (! o) {
				S.tr('getContent', 'Unknown args');
				return reject
				({ invalid:1, html:'', res:{ error: 'Unknown args' } });
			}
			const url = typeof o == 'object' ? o.url : o;
			if (! url.match(/^http(s?)\:\/\//)) {
				S.tr('Invalid URL');
				return reject({ invalid:1, html:'',
            res:{ error: 'Invalid URL', url: url } });
			}
			const Http =
          RegExp.$1 ? S.follow().https : S.follow().http;
			Http.get(o, res => {
				const Chunks = [];
				res.on('data', c => { Chunks.push(c) });
				res.on('end', () => {
					const Result = T.encode(Buffer.concat(Chunks),
						(c, h, e) => {
							return { invalid:e, html:(h || ''), char:c };
						});
					Result.res = res;
					return resolve(Result);
				});
			}).on('error', err => {
				S.tr('getContent:error', url, err);
				return reject({ invalid:1, res:err, html:'' });
			});
		});
	};
}
function HTML (S, RE) {
  const T = S.tool;
	S.tr1('CharCode', RE.char);
	const CS = this;
	const Length = RE.html ? RE.html.length : 0;
	S.tr1('Content Length', Length);
	      CS.invalid = () => { return RE.invalid };
CS.status = CS.res = () => { return RE.res };
	      CS.headers = () => { return RE.res.headers };
	  CS.httpVersion = () => { return RE.res.httpVersion };
	   CS.statusCode = () => { return RE.res.statusCode };
	CS.statusMessage = () => { return RE.res.statusMessage };
	  CS.responseURL =
	  CS.responseUrl = () => { return RE.res.responseUrl };
	         CS.char = () => { return RE.char };
	         CS.html = () => { return RE.html };
	CS.contentLength = () => { return Length };
	//
	CS.seo    = () => { return Base().seo };
	CS.ogp    = () => { return Base().ogp };
	CS.google = () => { return Base().google };
	CS.twitter= () => { return Base().twitter };
	CS.mixi   = () => { return Base().mixi };
  CS.parse  = (hook) => { return Base(hook) };
	//
	CS.pageTitle = (n) => {
		let v = ValueQuest
          ('title').replace(/^[^\|]+\|\s*/, '');
		return n ? T.Zcut(v, n, '...'): v;
	};
	CS.pageDescription = (n) => {
		let v = ValueQuest('description');
		return n ? T.Zcut(v, n, '...'): v;
	};
	CS.pageURL = () => {
		return CS.responseURL() || ValueQuest('url');
	};
	CS.pageKeywords = () => {
		return ValueQuest('keywordSlug')
				|| ValueQuest('news_keywords')
				|| ValueQuest('classification')
				|| ValueQuest('keywords');
	};
	CS.pageSiteName = () => {
		let v = Base().ogp.site_name;
		if (v && ! v.match(/^(?:jp)$/i)) {
			S.tr3('pageSiteName - ogp.site_name', v);
			return v.replace(/^[^\|]+\|\s*/, '');
		}
		v =  BASE.ogp['article:author']
			|| BASE.sai.author
			|| BASE.twitter.domain
			|| BASE.twitter.site
			|| BASE.twitter.creator
			|| BASE.seo.author;
		if (v) return v;
		v =  T.quest
      (RE.res, ['req','res','connection','_host'])
			|| CS.responseURL() || '';
		S.tr3('pageSiteName (last)', v);
		return v.replace(/^[^\:]+\:\/\//, '')
						.replace(/^w+\./i,'');
	};
	const ValueQuest = (key) => {
		return Base().ana[key]
				|| BASE.ogp[key]
				|| BASE.twitter[key]
				|| BASE.mixi[key]
				|| BASE.seo[key]
				|| '';
	};
	CS.pageImage = () => { return ValueQuest('image') };
	//
	let $, BASE;
	const Base = (hook) => {
		if ($) return BASE;
  	$ = S.parser().load(RE.html);
		BASE = { ogp:{},
			google:{}, twitter:{}, mixi:{}, ana:{}, sai:{},
			seo:{ title: $('head title').text() }
		};
		$('head meta').each((i, c) => {
			const m = $(c);
			let key = m.attr('property');
			if (key && /^og\:(.+)/.exec(key)) {
				BASE.ogp[T.A2a(RegExp.$1)] = m.attr('content');
			}
			key = m.attr('name');
			if (key) {
				key = T.A2a(key);
				if (/^twitter\:(.+)/.exec(key)) {
					BASE.twitter[RegExp.$1] = m.attr('content');
				} else if (/^google\-(.+)/.exec(key)) {
					BASE.google[RegExp.$1] = m.attr('content');
				} else if (/^mixi\-check\-(.+)/.exec(key)) {
					BASE.mixi[RegExp.$1] = m.attr('content');
				} else if (/^analyticsAttributes\.(.+)/.exec(key)) {
					BASE.ana[RegExp.$1] = m.attr('content');
				} else if (/^sailthru\.(.+)/.exec(key)) {
					BASE.sai[RegExp.$1] = m.attr('content');
				} else {
					BASE.seo[key] = m.attr('content');
				}
			}
		});
    if (hook) hook($);
		return BASE;
	};
}
