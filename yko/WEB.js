//
// yko/WEB.js
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'WEB.js';
const ver = `yko/${my} v190928.01`;
//
const metaReg = new RegExp(/<meta\s+[^>\n]+charset=([^\"\']+)/im);
//
let Y, T, S;
module.exports = function (y) {
	this.ver = ver;
	[S, Y, T] = [this, y, y.tool];
	const JS = {};
	S.http  = () =>
			{ return JS.http  || (JS.http = require('http')) };
	S.https = () =>
			{ return JS.https || (JS.https = require('https')) };
	S.follow = () =>
	{ return JS.follow || (JS.follow = require('follow-redirects')) };
	S.requestPromise = S.request = () =>
	{ return JS.request || (JS.request = require('request-promise')) };
	S.parser = () =>
			{ return JS.parser || (JS.parser = require('cheerio')) };
	//
	S.getContent = (o) => {
		Y.tr1('getContent');
		if (! o) {
			Y.tr('getContent', 'Unknown args');
			return { invalid:1, html:'', res:{ error: 'Unknown args' } };
		}
		const url = typeof o == 'object' ? o.url : o;
		if (! url.match(/^http(s?)\:\/\//)) {
			Y.tr('Invalid URL');
			return { invalid:1, html:'', res:{ error: 'Invalid URL', url: url } };
		}
		const Http = RegExp.$1 ? S.follow().https : S.follow().http;
		return new Promise ((resolve, reject) => {
			Http.get(o, res => {
				const Chunks = [];
				res.on('data', c => { Chunks.push(c) });
				res.on('end', () => {
					const Result = T.encode(Buffer.concat(Chunks),
						(c, h, e) => {
							return { char:c, html:(h || ''), invalid:e };
						});
					Result.res = res;
					return resolve(Result);
				});
			}).on('error', err => {
				Y.tr('getContent:error', err);
				return reject({ invalid:1, res:err, html:'' });
			});
		});
	};
	S.get = async (o) => {
		Y.tr1('get');
		let result;
		await S.getContent(o).then ( re => { result = re })
												 .catch( re => { result = re });
		return new _HTML_ (result);
	};
}
function _HTML_ (RE) {
	Y.tr1('CharCode', RE.char);
	const CS = this;
	const Length = RE.html ? RE.html.length : 0;
	Y.tr1('Content Length', Length);
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
	//
	CS.pageTitle = (n) => {
		let v = ValueQuest('title').replace(/^[^\|]+\|\s*/, '');
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
			Y.tr3('pageSiteName - ogp.site_name', v);
			return v.replace(/^[^\|]+\|\s*/, '');
		}
		v =  BASE.ogp['article:author']
			|| BASE.sai.author
			|| BASE.twitter.domain
			|| BASE.twitter.site
			|| BASE.twitter.creator
			|| BASE.seo.author;
		if (v) return v;
		v =  T.quest(RE.res, ['req','res','connection','_host'])
			|| CS.responseURL() || '';
		Y.tr3('pageSiteName (last)', v);
		return v.replace(/^[^\:]+\:\/\//, '')
						.replace(/^w+\./i,'');
	};
	CS.pageImage = () => { return ValueQuest('image') };
	//
	const ValueQuest = (key) => {
		return Base().ana[key]
				|| BASE.ogp[key]
				|| BASE.twitter[key]
				|| BASE.mixi[key]
				|| BASE.seo[key]
				|| '';
	};
	let $, BASE;
	const Base = () => {
		if ($) return BASE;
  	$ = S.parser().load(RE.html);
		BASE = { ogp:{},
			google:{}, twitter:{}, mixi:{}, ana:{}, sai:{},
			seo:{ title: $('head title').text() }
		};
		$('head meta').each((i, c) => {
			const m = $(c);
			let key = m.attr('property');
			if (key && key.match(/^og\:(.+)/)) {
				BASE.ogp[T.A2a(RegExp.$1)] = m.attr('content');
			}
			key = m.attr('name');
			if (key) {
				key = T.A2a(key);
				if (key.match(/^twitter\:(.+)/)) {
					BASE.twitter[RegExp.$1] = m.attr('content');
				} else if (key.match(/^google\-(.+)/)) {
					BASE.google[RegExp.$1] = m.attr('content');
				} else if (key.match(/^mixi\-check\-(.+)/)) {
					BASE.mixi[RegExp.$1] = m.attr('content');
				} else if (key.match(/^analyticsAttributes\.(.+)/)) {
					BASE.ana[RegExp.$1] = m.attr('content');
				} else if (key.match(/^sailthru\.(.+)/)) {
					BASE.sai[RegExp.$1] = m.attr('content');
				} else {
					BASE.seo[key] = m.attr('content');
				}
			}
		});
		return BASE;
	};
}
