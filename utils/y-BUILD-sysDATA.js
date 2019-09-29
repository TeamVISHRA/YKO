//
// y-discord.js
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const ver = 'y-sysDATA_SETUP.js v190916.01';
//
const yko = require('./yko/CORE.js');
const Y = new yko ();
//
const KEY = Y.conf.sysDATA.keys;
//
Y.start();
Y.box.any(KEY.type, KEY).then( db => {
	if (db.isNew() || ! db.get('DontUpdate')) {
		db.inport( value() );
		Y.tr( db.isNew() ? 'New setup !!' : '... Updated');
		return db.preper();
	} else {
		Y.tr('No update allowed !!');
	}
}).then(o=> {
	Y.finish();
//	Y.box.close();
});
//
function value () {
	let MSG = message();
	return {
		discord: {
			guilds: {
				'384997595149500416': { // サタデーナイト
					members: {},
					join: {
						msg1: MSG.discord.join1,
						msg2: MSG.discord.join2,
						LogCH: '610174166712451092', // #参加者
						color: 0x2d4fe4
					},
					exit: {
						LogCH: '610174357502951425', // #退出者
						color: 0x9f5520
					},
					toTwitch: {
						toCH: 'milkyvishra',
						fromCH: '579199949233717268', // #Twitch-live
						message: 'HolidayOrnament <name>：<message>'
					},
					CRON: {
						RSSreader: {
							toCH: '613717562936655872', // #ニュース
							sites: [
								{ url: 'https://gigazine.net/news/rss_2.0/' },
								{	url: 'https://news.google.com/rss?ie=UTF-8&oe=UTF-8&topic=po&hl=ja&gl=JP&ceid=JP:ja' },
                { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCcE10s4MFy4eed7q7QkonZg' }
							],
						}
					}
				}
			}
		},
		twitch: {
			channels: {
				milkyvishra: {
					members: {},
          chat: {
            ignoreNames: ['ykobot']
          },
					toDiscord: {
						message: '>**<name>**：<message> -Twitch',
						webhook: {
							id: '609208039182041098', // #Twitch-live
							token: 'gt03QUm0D-2TnpQbLMpX_3vfGABKB_pvl0XmMv_27TeMdOIBxDTLQLEm929FbtrnuxHZ'
						}
					}
				}
			}
		}
	}
}
function message () {
	const here = require('here').here;
	let msg = {
		discord: {
			join2: 'まず「#🔰はじめに読んでね」に目を通して下さいね。'
		}
	};
	msg.discord.join1 = here(/*
<name> へようこそ!!

わたしは、👆でお仕事をしてるボットです。

まず「#🔰はじめに読んでね」に目を通してから、「#🔰welcom」に自己紹介を投稿して下さいネ!!

**👀管理者が確認すると所定の権限が割り当てられます。**

ただし、リアルな仕事等の都合上、常にチェックしている訳ではありません。
場合によっては大変時間がかかる事がありますので気長にお待ち下さい。

`※権限が割り当てられると、利用できるチャンネルが増えます。`

それでは、今後とも宜しくお願い致します。
*/).unindent();
	return msg;
};
