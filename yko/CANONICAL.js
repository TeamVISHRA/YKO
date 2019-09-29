//
// yko/CANONICAL.js
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const ver = 'yko/CANONICAL.js v190908.01';
//
module.exports = function (Y) {
	this.ver = ver;
	const S = this;
	//
	S.regEmail = () { return new RegExp(
		  '^[a-zA-Z0-9.!#$%&'*+\\/=?^_`{|}~-]+'
		+ '@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$'
		);
	};
	//
	S.ini   = (n) => { return Number.isInteger(n) };
	S.str   = (s) => { return typeof s == 'string' ? true: false };
	S.bool  = (b) => { return (b == true || b == false) ? true: false };
	S.email = (m) => { return m.match(S.regEmail()) ? true : false };
};
//
