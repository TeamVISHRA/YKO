'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'yTwitch.js';
const ver = `yko/${my} v191105`;
//
const T = new (require('./TOOL.js')),
 ytFake = './Twitch/ytTmiFake.js';
//
let STATE = 'Normal';
module.exports.Super = function (Y, Ref) {
  const S = Y.superKit('twtich', this, Y, Ref);
  S.ver = `${ver} :S`;
  S.DebugCall = DebugCall(S);
  build_super_comps(S);
}
module.exports.Unit = function (R, Ref) {
  const U = R.unitKit('twitch', this, R, Ref);
    U.ver = `${ver} :U`;
  U.super = R.un.Twitch;
  Ref.$unit   (U);
  Ref.$onFake (U);
}
module.exports.init = function (Y, Ref) {
  const G = Y.superKit('twitch', this, Y, Ref);
  G.ver = `${ver} :G`;
  build_guest_comps(G);
}
module.exports.initFake = function (Y, Ref) {
  Y.tr4('[Twitch] OK !! initFake');
  Ref.$onFake = U => { _onFake_(Y, Ref) };
}
function build_super_comps (S) {
  S.tr4('[Twitch] build_super_comps');
  S.onFake = () => { _onFake_(S.un, S.Ref) };
  S.init = () => {
    const RUNS = () => {
      for (let [key, func] of T.e(S.runners())) {
        S.tr3(`[Twitch] '${key}' started running.`);
        func();
    } };
    const DISP = (ON, Func) =>
      { return build_super_dispatch(S, ON, Func) };
    build_base_comps(S, RUNS, DISP);
    const ENGINE = () => {
      try {
        return S.connect()
                .catch(e=> S.thrown(`[Twitch]`, e));
      } catch (err) {
        S.tr('[Twitch] Warning', err);
        setTimeout(ENGINE, 10000);
      }
    };
    S.engine(ENGINE);
    S.run = S.un.run;
    S.Ref.$unit = prepare_child_comps(S.un, S.Ref);
    S.Ref.$onFake = () => {};
    S.init = false;
  };
}
function build_guest_comps (G) {
  G.tr4('[Twitch] build_guest_comps');
  const RUNS = () => {};
  const DISP = (ON, Func) => {
    build_guest_dispatch(G, ON, Func);
  };
  build_base_comps(G, RUNS, DISP);
  G.on('runners', 'twtich', G.connect);
  G.Ref.$unit = U => {
    U.say = G.say;
    U.toDiscord = (...args) =>
        { return G.Ref.toDiscord(U, ...args) };
  };
}
function build_base_comps (X, RUNS, DISP) {
  X.tr4('[Twitch] build_base_comps');
  const c = X.un.conf.twitch.chat;
  X.loginID = () => { return c.loginID };
  X.Ref.MSG_WRAP = X.debug()
      ? (msg) => { return `${msg} (Debug)` }
      : (msg) => { return msg };
  //
  X.Ref.tmi = () => {
    const TMI = require('tmi.js');
    return new TMI.client({
      identity: {
        username: c.loginID,
        password: c.oauthToken
      },
      channels: c.loginChannels
    });
  };
  X.say = (ch, msg) => {
    return new Promise ( resolve => {
      X.tr4('[Twitch] say', ch);
      X.connect().then( client => {
        resolve(client.say(ch, X.Ref.MSG_WRAP(msg)));
      });
    });
  };
  const ON = X.rack.get('ON');
  for (let k of ['connected', 'ignoreAction']) {
    const key = `twitch_chat_${k}`;
    if (! ON[key]) { ON[key] = () => {} }
    else { X.tr3('init', `found: '${key}'`) }
  }
  let CLIENT;
  X.connect = () => {
    return new Promise ( resolve => {
      if (CLIENT) return resolve(CLIENT);
      let clt = X.Ref.tmi();
      clt.on('connected', (addr, port) => {
        RUNS();
        ON.twitch_chat_connected(addr, port);
        X.tr(`[Twitch] Connected Chat:${addr}:${port} (${STATE})`);
        return resolve(CLIENT = clt);
      });
      let CM; if (CM = ON.twitch_chat_message) {
        clt.on('message', DISP(ON, CM));
      }
      clt.connect();
      X.tr3('[Twitch] login status', c.loginID, c.loginChannels);
      X.tr7('[Twitch] login password: ', c.oauthToken);
    });
  };
  X.disconnect = () => {
    if (! CLIENT) return;
    try { CLIENT.disconnect() }
    catch (e) { X.tr('[Twitch] Warning (disconnect)', e) };
    CLIENT = false;
    X.tr3('[Twitch] disconnect');
  };
  if (X.rack.has('Discord')) {
    X.Ref.toDiscord = (U, ch, name, msg) => {
      return new Promise (async (resolve, reject) => {
        let cf;
        await U.root.sysDB(`Twitch.${CH(ch)}`)
                .cash('toDiscord').then(x=> cf = x );
        if (! cf || ! cf.webhook) {
          U.tr4(`[Twitch] toDiscord: Cancel (Unknown config) !!`);
          return reject
            ({ YKO:1, result: 'Configuration not setup.' });
        }
        U.tr3('[Twitch] toDiscord:webhook');
        U.tr7('[Twitch] config', cf);
        U.root.see(cf.webhook).then(w => {
          return U.root.Discord.webhook
          ([w.id, w.token], T.tmpl(cf.message, {
          name: (name || '(N/A)'),
       message: X.Ref.MSG_WRAP(msg  || '...<None>')
          })).then(x=> resolve({ YKO:1, success:1 }));
        });
      });
    };
  } else {
    X.Ref.toDiscord = async () => {};
  }
  X.Ref.$onFake = U => {};
  if (_isSleep_(X.un)) {
    X.tr4('[Twitch] onFake');
    _onFake_(X.un, Ref);
  }
  return X;
}
function prepare_child_comps (Y, Ref) {
  Y.tr4('[Twitch] prepare_child_comps');
  return U => {
    const S = U.super;
    U.App = (name) => {
      const JS = require(`./Twitch/App/yta${name}.js`);
      return new JS.Unit (U, Ref);
    };
    U.unitKit = (name, X, ...args) => {
      U.root.unitKit(name, X, ...args);
      X.loginID = S.loginID;
      return X;
    };
    let [TMP, H] = [T.c(null)];
    const IS = (o) => { return (TMP.is = o) };
    U.is = () => { return TMP.is };
    U.start = async (ch, context, msg) => {
      U.tr4('[Twitch] start (:U)');
      H = context;
      const Uname = H['display-name'] || H.username || 'N/A';
       U.handler = () => { return context };
       U.channel = () => { return ch };
       U.content = () => { return msg };
      U.dispName = () => { return Uname };
      U.username = () => { return H.username };
      let cf;
      await U.root.sysDB(`Twitch.${CH(ch)}`)
        .cash('chat').then(x=> cf = x || { ignoreNames: [] });
      U.tr4('[Twitch] <sysDB>...ignoreNames', cf.ignoreNames);
      const target = H.username.toLowerCase();
      if (cf.ignoreNames.find(o=> o == target)) {
        U.tr3('[Twitch] Message:ignore - hit', target);
        IS({ ignore: true });
        return U;
      }
      U.root.brain.isCall(msg, IS);
      return U;
    };
    let MemberDB;
    U.finish = () => {
      if (MemberDB) MemberDB.prepar();
      return U.root.finish();
    };
    U.reply = async (msg) => {
      return S.say(U.channel(), msg);
    };
    U.toDiscord =
        (...args) => { return Ref.toDiscord(U, ...args) };
    U.say = S.say;
    U.every = () => {
      U.tr3('[Twitch] every');
      U.toDiscord(U.channel(), U.dispName(), U.content())
        .then(x=> { return U.$countUpMemberDB() })
        .then(x=> U.finish())
        .catch(x=> {
        if (x && T.isHashArray(x) && x.YKO) {
          if (x.result) U.tr3(`[Twitch] every`, x.result);
          return U.$countUpMemberDB().then(x => U.finish());
        }
        U.throw(`[Twitch] every`, x);
      });
    };
    U.memberNow = async () => {
      if (MemberDB) return MemberDB;
      const Ch = U.channel()
      || U.throw(`[Twitch:ydM] memberNow: Unknown channel.`);
      await U.root.sysDB(`Twitch`)
      .member(U.username()).then(x=> MemberDB = x);
      return MemberDB;
    };
    U.$countUpMemberDB = () => {
      return U.memberNow().then(box=> {
        box.util().inc('countPost')
           .util().setDefault('tmLastPost');
      });
    };
  };
}
function build_super_dispatch (S, ON, Func) {
  S.tr4(`[Twitch] build_super_dispatch`);
  return (ch, h, msg, self) => {
    if (self) return;
    S.tr3(`[Twitch] event status`, ch, msg, self);
    S.tr7('[Twitch] context', h);
    let R;
    S.start(my).then( unitRoot => {
      R = unitRoot;
      return R.Twitch.start(ch, h, msg);
    }).then( ytM => {
      const is = ytM.is();
      if (is.ignore) return R.finish();
      if (is.answer) {
        ytM.reply(is.answer);
        return ytM.toDiscord
        (ch, S.loginID(), is.answer).then(x=> R.finish());
      }
      if (! is.post) return R.finish();
      return Func(ytM, is);
    }).catch(e=> {
      if (R) R.rollback();
      S.throw(ver, e);
    });
  };
}
function CH (ch) {
  return T.A2a(ch.match(/^\#(.+)/) ? RegExp.$1 : ch);
}
function _onFake_ (X, Ref) {
  X.tr4('[Twitch] onFake');
  STATE = 'Fake';
  Ref.tmi = () => {
    const JS = require(ytFake);
    return new JS.on (X);
  };
}
function _isSleep_ (X) {
  if (X.debug()) {
    STATE = 'Debug';
    if (X.conf.sleep) {
      X.tr3('[Twitch] im Sleep !!');
      return true;
    }
  }
  return false;
}
function DebugCall (S) {
  return () => {
    const [,, ...ARGV] = process.argv;
    if (ARGV.length < 1) return S;
    const Fake = require(ytFake);
    return Fake.call(S, ARGV);
  };
}
