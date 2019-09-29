//
// yko/Twitch/ytChat.js
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ytChat.js';
const ver = `yko/Twitch/${my} v190929.01`;
//
let Y, P, S, T;
module.exports = function (y, p) {
	this.ver = ver;
	[S, Y, P, T] = [this, y, p, y.tool];
	S.conf = P.conf.chat;
	S.im = P.im.chat;
	build_component();
	//
	S.init = () => {
		if (Y.REQ1() == 'Discord') {
			Y.runners(S.connect);
		} else {
			build_engine();
		}
	}
	S.preparFake = () => {
		const FAKE = require('./yChatFAKE.js');
		S.tmi = () => { return new FAKE (Y, S) } };
	};
	if (Y.debug() && S.im.debug_sleep) S.preparFake();
};
let MSG_WRAP;
function build_component () {
	Y.tr3('build_component');
	const APP = {};
	S.App = (k, arg) => {
		if (APP[k]) return APP[k];
		const LIB = require(`./App/yta${k}.js`);
		APP[k] = new LIB (Y, S, arg);
		return APP[k];
	};
	MSG_WRAP = Y.debug() ? (msg) => {
		return `${msg} (Debug)`;
	}: (msg) => { return msg };
	S.say = (ch, msg) => {
		S.connect().then( async o => {
			o.say(ch, msg);
			return o;
		});
	};
	const ON = Y.ON();
	for (let k of ['connected', 'ignoreAction']) {
		if (! ON[`twitch_chat_${k}`])
		ON[`twitch_chat_${k}`] = () => {};
	}
	let CLIENT;
	S.client = S.bot = () => { return CLIENT };
	S.tmi = () => {
		const TMI = require('tmi.js');
		return new TMI.client({
			identity: {
				username: S.im.loginID,
				password: S.im.oauthToken
			},
			channels: S.im.tagetChannels
		});
	};
	S.connect = async () => {
		if (CLIENT) return CLIENT;
		CLIENT = S.tmi();
		CLIENT.on('connected', (addr, port) => {
			ON.twitch_chat_connected(addr, port);
			Y.tr(`[[[ Connect ... Twitch Chat:${addr}:${port} ]]]`);
		});
		let F; if (F = ON.twitch_chat_message) {
			Y.tr3("ON ... 'twitch_chat_message'");
			CLIENT.on('message', build_dispatch(F));
		}
		await CLIENT.connect();
		Y.tr3('Twitch login status', `"${S.im.loginID}"`
		+ S.im.tagetChannels.map(s=> `'${s}'`).join(', ') );
		Y.tr7('password: ' + S.im.oauthToken);
		return CLIENT;
	};
	S.disconnect = () => {
		try { CLIENT.disconnect() }
		catch (e) { Y.tr('disconnect: Warning', e) };
		CLIENT = false;
	};
	Y.onRollback(S.disconnect);
}
function build_dispatch (F) {
	Y.tr2('build_dispatch');
	return async (ch, h, msg, self) => {
		//	if (self) return; // bot call << This doesn't work
		Y.tr3(`event status`, `"${ch}", "${self}", "${msg}"`);
		Y.tr5('context', h);
		S.start(h, ch, msg);
		let c;
		const chKey = channelKey(ch);
		await Y.sysDATA.cash(['twitch', 'channels', chKey, 'chat'])
		.then( conf => { c = conf.value });
		Y.tr4('twitch-config-data', c);
		const check = T.A2a(S.dispName());
		Y.tr3('Message:ignore - target', check);
		Y.tr3('Message:ignore - list', c.ignoreNames);
		if (c.ignoreNames
			&& c.ignoreNames.find(o=> o == check)) {
				Y.tr3('Message:ignore - hit', check);
				return S.finish();
			}
			const is = Y.brain.isCall(msg);
			if (is.answer) {
				S.say(S.channel(), S.dispName(), is.answer);
				S.toDiscord(S.channel(), S.dispName(), is.answer);
				return S.finish();
			}
			//		await Y.box.any('twitch-member',
			//		{ id:S.channel(), name:S.Msg().username }).then( box => {
			//			S.box = box.isNew() ? initBOX() : box;
			//		});
			return F(S, is);
		};
	}
	function initBOX (box) {
		box.set('createTimeStamp', Y.tool.unix());
		box.set('LimitData', {}); // name:{ limit:(unix), value:(...) }
		return box;
	}
	function cleanBox () {
		if (! S.box) Y.throw(`'S.box' is not create`);
		const Now = Y.tool.unix();
		const Box = S.box.get('LimitData');
		for (let [k, v] of Object.entries(Box)) {
			if (! v.limit || v.limit < Now) delete Box[k];
		}
		return S.box.set('LimitData', Box);
	}
	function build_engine () {
		S.start = (context, channel, msg) => {
			Y.start();
			TMP = {
				$name: (context['display-name']
				|| context.username
				|| 'N/A' )
			};
			S.handler = S.context = () => { return context };
			S.channel  = () => { return channel };
			S.content  = () => { return msg };
			S.dispName = () => { return TMP.$name };
			S.username = () => { return context.username };
		};
		S.reply = (msg) => {
			let handler = S.handler();
			if (handler) return handler.say(MSG_WRAP(msg));
			return S.say(S.channel(), msg);
		};
		S.tmp = () => { return TMP };
		const Reset = () => {
			TMP = {};
			S.dispName = S.username = S.channel =
			S.handler  = S.context  = S.content = false;
		};
		S.rollback = () => {
			Reset();
			Y.rollback();
		};
		S.finish = () => {
			//		Reset();
			Y.finish();
		};
		S.every = (is) => {
			S.toDiscord(S.channel(), S.dispName(), S.content());
		};
		S.toDiscord = async (ch, uname, msg) => {
			Y.tr1('toDiscord');
			let chName = channelKey(ch);
			let c;
			await Y.sysDATA
			.cash(['twitch', 'channels', chName, 'toDiscord'])
			.then( db => { c = db.value });
			Y.tr2('toDiscord', 'check');
			if (! c || ! c.webhook) return;
			Y.tr5('toDiscord', c);
			const w = c.webhook;
			Y.tr4('toDiscord - webhook', w);
			Y.Discord.webhook([w.id, w.token], T.tmpl(c.message, {
				name: (uname || '(N/A)'), message: (msg || '')
			}));
		};
		const ENGINE = () => {
			try {
				S.connect();
			} catch (err) {
				Y.rollback();
				Y.tr('catch error:', err);
				setTimeout(ENGINE, 10000);
			}
		};
		Y.engine(ENGINE);
		P.run = Y.run;
	}
	function channelKey (channel) {
		return T.A2a(channel.match(/^\#(.+)/) ? RegExp.$1 : channel);
	};
