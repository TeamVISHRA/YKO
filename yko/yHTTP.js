'use strict'; 
//
// yko/yHTTP.js
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'yHTTP.js';
const ver = `yko/${my} v191012.01`;
//
const DefaultPort    =  8000;
const DefaultSockTTL =  4000;
const DefaultRestart = 15000;
//
module.exports.Super = function (Y, Ref) {
  const S = Y.superKit('http', this, Y, Ref);
    S.ver = `${ver} :S`;
  build_super_comp(S);
};
module.exports.Unit = function (R, Ref) {
  const U = R.unitKit('http', this, R, Ref);
    U.ver = `${ver} :U`;
  build_unit_comp(U);
};
module.exports.init = function (Y, Ref) {
  const S = Y.superKit('http', this, Y, Ref);
    S.ver = `${ver} :I`;
  build_init_comp(S);
};
module.exports.onFake = function (Y, Ref) {
};
function build_super_comp (S) {
  S.init = () => {
    build_base_comp(S);
    const ENGINE = () => {
      try {
        S.server();
      } catch (err) {
        S.close();
        S.tr('[HTTP] Warning', err);
        setTimeout(ENGINE, DefaultRestart);
      }
    };
    S.engine(ENGINE);
}
function build_unit_comp (U) {
  build_base_comp(U);
}
function build_init_comp (S) {
  build_base_comp(S);
  S.onRollback(S.close);
	S.runners(S.server);
}
function build_base_comp (X) {
   const HTTP = require('http'),
        Socks = new Map([]),
        Count = 0,
         Port = (X.conf.port      || DefaultPort),
         sTTL = (X.conf.socketTTL || DefaultSockTTL),
           ON = X.rack.get('ON');
  if (! ON.http_api_action) {
  X.throw(`[HTTP] Please setup "Y.on('http_api_action', ... )"`);
  }
  let SRV;
  X.server = () => {
    if (SRV) return SRV;
    SRV = HTTP.createServer();
    SRV.on('request', ON.http_api_action);
    SRV.on('connection', socket => {
      const Id = ++Count;
      Socks.set(Id, socket);
      X.tr4(`[HTTP] socket = opened: ${Id}`);
      socket.on('close', () => {
        X.tr4(`[HTTP] socket - closed: ${Id}`);
        Socks.delete(Id);
      })
      socket.setTimeout(sTTL);
    });
    SRV.listen(Port, () => {
      X.tr(`[HTTP] << START >>`, `port:${Port}`);
    });
    return SRV;
  };
  X.close = () => {
    SRV.close();
    for (let id in Socks) {
      X.tr4(`[HTTP] socket - destroyed: ${id}`);
      Socks[id].destroy();
      Socks.delete(id);
    }
    Count = 0;
    SRV = false;
    X.tr3(`[HTTP] << CLOSE >>`;
  };
}
