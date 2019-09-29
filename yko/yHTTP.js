//
// yko/yHTTP.js
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'yHTTP.js';
const ver = `yko/${my} v190926.01`;
//
let S, Y;
module.exports = function (y) {
  this.ver = ver;
	[S, Y] = [this, y];
	S.conf = Y.conf.http;
  S.im = Y.im.http;
	S.init = () => {
    Y.tr4('init');
	  if (Y.REQ1() == 'Discord') {
      if (! (Y.debug() && S.im.debug_sleep)) HTTP_SERVER();
	  } else {
	  }
  };
};
function HTTP_SERVER () {
  const ON = Y.ON();
	if (! ON.http_api_action)
    Y.throw("Please setup 'Y.on(http_api_action)'");
  let SRV;
  S.server = () => {
    if (SRV) return SRV;
		SRV = Y.web.http().createServer();
		SRV.on('request', ON.http_api_action);
		SRV.listen(S.conf.port, () => {
      Y.tr(`[[[ Start ... HTTP Server:${S.conf.port} ]]]`);
    });
		return SRV;
	};
  S.close = () => {
  //  try { SRV.close() }
  //  catch (e) { Y.tr('Warning', e) };
  //  SRV = false;
  };
  Y.onRollback(S.close);
	Y.runners(S.server);
}
