'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'yTwitch.js';
const ver = `yko/${my} v191016`;
//
const ytFake = './Twitch/ytTmiFake.js';
//
let STATE = 'Normal';
module.exports.Super = function (Y, Ref) {
  const S = Y.superKit('twtich', this, Y, Ref);
  S.ver = `${ver} :S`;
  S.DebugCall = DebugCall(S);
  build_super_comps(S);
}
module.exports.Unit = function (R, Ref) {
  const U = R.unitKit('twtich', this, R, Ref);
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
module.exports.onFake = function (Y, Ref) {
  Y.tr4('[Twitch] exports.onFake');
  Ref.$onFake = U => { onFake(Y, Ref) };
}
function build_super_comps (S) {
  S.tr4('[Twitch] build_super_comps');
  S.onFake = () => { onFake(S.un, S.Ref) };
  S.init = () => {
    const RUNS = () => {
      for (let [key, func] of S.tool.e(S.runners())) {
        S.tr3(`[Twitch] '${key}' started running.`);
        func();
    } };
    const DISP = (ON, Func) =>
      { return build_super_dispatch(S, ON, Func) };
    build_base_comps(S, RUNS, DISP);
    const ENGINE = () => {
      try {
        S.connect();
      } catch (err) {
        S.tr('Warning', err);
        setTimeout(ENGINE, 10000);
      }
      return S.client();
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
  const c = X.un.im.twitch.chat;
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
      channels: c.tagetChannels
    });
  };
  X.say = async (ch, msg) => {
    X.connect().then( async H => {
      return H.say(ch, X.Ref.MSG_WRAP(msg));
    });
  };
  const ON = X.rack.get('ON');
  for (let k of ['connected', 'ignoreAction']) {
    const key = `twitch_chat_${k}`;
    if (! ON[key]) { ON[key] = () => {} }
    else { X.tr3('init', `found: '${key}'`) }
  }
  let CLIENT;
  X.connect = async () => {
    if (CLIENT) return CLIENT;
    CLIENT = X.Ref.tmi();
    CLIENT.on('connected', (addr, port) => {
      RUNS();
      ON.twitch_chat_connected(addr, port);
      X.tr(`[Twitch] Connected Chat:${addr}:${port} (${STATE})`);
    });
    let CM;
    if (CM = ON.twitch_chat_message)
          CLIENT.on('message', DISP(ON, CM));
    await CLIENT.connect();
    X.tr3('[Twitch] login status', c.loginID, c.tagetChannels);
    X.tr7('[Twitch] login password: ' + c.oauthToken);
    return CLIENT;
  };
  X.disconnect = () => {
    if (! CLIENT) return;
    try { CLIENT.disconnect() }
    catch (e) { X.tr('[Twitch] Warning (disconnect)', e) };
    CLIENT = false;
    X.tr3('[Twitch] disconnect');
  };
  X.client = async () => { return X.connect() };
  if (X.rack.has('Discord')) {
    X.Ref.toDiscord = async (U, ch, name, msg) => {
      const Key = `twitch.channels.${CH(X, ch)}.toDiscord`;
      X.tr3('[Twitch] toDiscord', Key);
      let cf;
      await U.root.sysDB().get(Key).then(x=> cf = x );
      if (! cf || ! cf.webhook) {
        U.tr4('[Twitch] toDiscord', 'Cancel( Unknown config )');
        return;
      }
      U.tr3('[Twitch] toDiscord:webhook');
      U.tr7('[Twitch] config', cf);
      const w = cf.webhook;
      U.root.Discord.webhook
            ([w.id, w.token], U.tool.tmpl(cf.message, {
          name: (name || '(N/A)'),
       message: X.Ref.MSG_WRAP(msg  || '...<None>')
      }));
    };
  } else {
    X.Ref.toDiscord = () => {};
  }
  X.Ref.$onFake = U => {};
  if (isSleep(X.un)) {
    X.tr4('[Twitch] onFake');
    onFake(X.un, Ref);
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
    let [TMP, H] = [Y.tool.c(null)];
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
      const Key = `twitch.channels.${CH(U, ch)}.chat`;
      U.tr4('[Twitch] check:ignore');
      let cf;
      await U.root.sysDB().get(Key)
             .then(x=> cf = x || { ignoreNames: [] });
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
    U.reply = async (msg) => {
      return S.say(U.channel(), msg);
    };
    U.every = () => {
      U.tr3('[Twitch] every');
      U.toDiscord(U.channel(), U.dispName(), U.content());
      U.root.finish();
    };
    U.toDiscord =
        (...args) => { return Ref.toDiscord(U, ...args) };
    U.say = S.say;
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
        ytM.toDiscord(ch, S.loginID(), is.answer);
        return R.finish();
      }
      if (! is.post) return R.finish();
      return Func(ytM, is);
    }).catch(e=> {
      if (R) R.rollback();
      S.throw(ver, e);
    });
  };
}
function CH (X, ch) {
  return X.tool.A2a(ch.match(/^\#(.+)/) ? RegExp.$1 : ch);
}
function onFake (X, Ref) {
  X.tr4('[Twitch] onFake');
  STATE = 'Fake';
  Ref.tmi = () => {
    const JS = require(ytFake);
    return new JS.on (X);
  };
}
function isSleep (X) {
  if (X.debug()) {
    STATE = 'Debug';
    if (X.im.sleep) {
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
