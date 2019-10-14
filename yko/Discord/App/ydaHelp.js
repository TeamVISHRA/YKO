'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ydaTools.js';
const ver = `${my} v191008.01`;
//
module.exports.Unit = function (P) {
  this.ver = ver;
	const S = this,
        R = P.root,
       PF = P.root.brain.prefix();
	S.run = () => {
	  P.delete();
	  P.send({ embed: {
		  title: 'YKO ヘルプ',
		  color: 0x0083FC, fields: [
		{ name: `${PF}dice help`,
      value: '`・サイコロ機能のヘルプ表示`' },
		{ name: `${PF}sp help`,
      value: '`・時間計測機能のヘルプ表示`' },
		{ name: `${PF}tool help`,
      value: '`・ツール機能のヘルプ表示`' },
		{ name: `${PF}to help`,
      value: '`・Twitch 投稿機能のヘルプ表示`' },
	  ]}}, 60);
    R.finish();
  };
}
