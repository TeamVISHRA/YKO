'use strict'; 
//
// yko/yHTTP.js
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'yHTTP.js';
const ver = `yko/${my} v191012.01`;
//
module.exports.Super = function (Y, Ref) {
  const S = this;
    S.ver = `${ver} :S`;
	 S.conf = Y.conf.http;
     S.im = Y.im.http;
  build_super_component(Y, Ref);
};
module.exports.Unit = function (Y, P, Ref) {
  const U = this;
     U.un = Y;
   U.root = P;
    U.ver = `${ver} :U`;
	 U.conf = Y.conf.http;
     U.im = Y.im.http;
  
};
module.exports.init = function (Y, Ref) {
};
module.exports.onFake = function (Y, Ref) {
};



function HTTP_SERVER () {
  const ON = Y.ON();
	if (! ON.http_api_action)
    Y.throw("Please setup 'Y.on(http_api_action)'");
  let SRV;
  S.server = () => {
    if (SRV) return SRV;
		SRV = Y.web().http().createServer();
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
