//
// yko/BRAIN/ybTalkData.js
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ybTalkData.js';
const ver = `yko/BRAIN/${my} v190924.01`;
//
// I   = 投稿パターン（正規表現）
// A   = 回答
// tz  = 時間帯識別
// sea = 季節識別
//
exports.source = (Y) => {
	const ps = Y.brain.parts;
	const Yname = `${ps.myNames[0]}${ps.myNames[1]}`;
	const Bot   = ps.myNames[2];
	return {
		FIRST: {
			1: { tz:'G', I:'(?:初|しょ)(?:見|けん)',
				A:{ G:'<name>さん、初めまして。よろしくね！' }},
			2: { tz:'M', I:'お(?:早|はよ)う',
				A:{ G:'<name>さん、お早うございます。' }},
			3: { tz:'M', I:'(?:初|しょ)(?:見|けん)',
				A:{ G:'初見さん、おはようございます。' }},
			4: { tz:'R', I:'こんにち(わ|は)',
				A:{ G:'<name>さん、お初にお目にかかります。' }},
			4: { tz:'R', I:'(?:初|はじ)めまして',
				A:{ G:'<name>さん、' }},
			5: { tz:'R', I:'(?:初|しょ)(?:見|けん)',
				A:{ G:'ウェルカム！！ 初見さん、' }},
			6: { tz:'D', I:'こんばん(?:わ|は)',
				A:{ G:'<name>さん、いらっしゃいませ。' }},
			6: { tz:'D', I:'(?:初|はじ)めまして',
				A:{ G:'<name>さん、こちらこそ初めまして' }},
			7: { tz:'D', I:'(?:初|しょ)(?:見|けん)',
				A:{ G:'<name>さん、こんばんわ。' }},
		},
		REG: {
			1: { tz:'M', I:`お(?:早|はよ)う`,
				A:'<name>君おはよう～～～' },
			2: { tz:'M', I:'こんにちわ', A:'<name>さん、おはようございます。' },
			3: { tz:'G', I:`${Yname}${Bot}?.*(?:て|は).*${Bot}`,
				A:'ボットのＹちゃんでーす。' },
		},
		GEN: {

		}
	};
}
