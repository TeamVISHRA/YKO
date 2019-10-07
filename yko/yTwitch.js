'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'yTwitch.js';
const ver = `yko/${my} v191007.01`;
//
module.exports.Super = function (Y, R) {
  const S = this;
  S.ver  = `${ver} :S`;
  S.conf = Y.conf.twitch;
  S.im   = Y.im.twitch;
  build_super_comp(Y, S, R);
}
module.exports.Unit = function (Y, X, R) {
  const U = this;
  U.ver  = `${ver} :U`;
  U.unit = X;
  U.conf = Y.conf.twitch;
  U.im   = Y.im.twitch;
  build_unit_comp(Y, U, R);
}
module.exports.init = function (Y, R) {
  createRD(Y, R, cd => {
    if (cd.$JS.init) cd.$JS.init(Y, S, cd);
  });
}
module.exports.onFake = function (Y, R) {
}
function build_super_comp (Y, S, R) {
  S.isSleep = () => { isSleep(Y) };
  createRD(Y, R, cd => {
    if (cd.$JS.Super) {
      S[cd.$name] = cd.$JS.Super(Y, S, cd);
    }
  });
  S.init = () => {
    for (let [key, cd] of Y.tool.e(R.Chailds)) {
      const Obj = S[cd.$name];
      if (Obj && Obj.init) Obj.init(Y, S, cd);
    }
    if (S.isSleep()) {
      for (let [key, cd] of Y.tool.e(R.Chailds)) {
        if (cd.$JS.onFake) cd.$JS.onFake(Y, S, cd);
      }
    }
    S.init = false;
  };
}
function build_unit_comp (Y, U, R) {
  for (let [key, cd] of Y.tool.e(R.Chailds)) {
    cd.$unit(U, cd);
    cd.$onFake(U, cd);
  }
}
function createRD (Y, R, func) {
  R.Chailds = Y.tool.o(null);
  for (let name of ['ytChat']) {
    const Rd = Y.baseRD(name);
    func( R.Chailds[Rd.$name] = Rd );
  }
  return R.Chailds;
}
function isSleep (Y) {
  return (Y.debug() && Y.im.twitch.sleep) ? true: false;
}
