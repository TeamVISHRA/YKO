'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'yTwitch.js';
const ver = `yko/${my} v191010.01`;
//
const ytFake = './Twitch/ytTmiFake.js';
//
let STATE = 'Normal';
module.exports.Super = function (Y, Ref) {
  const S = Y.superKit('twtich', this, 0, 0, Ref);
  S.ver = `${ver} :S`;
  S.DebugCall = DebugCall(S);
  build_super_comps(S);
}
module.exports.Unit = function (R, Ref) {
  const U = R.unitKit('twtich', this, 0, 0, Ref);
    U.ver = `${ver} :U`;
  U.super = R.un.Twitch;
  Ref.$unit   (U);
  Ref.$onFake (U);
}
module.exports.init = function (Y, Ref) {
  const G = Y.superKit('twitch', this, 0, 0, Ref);
  G.ver = `${ver} :G`;
  build_guest_comps(G);
}
module.exports.onFake = function (Y, Ref) {
  Y.tr4('yTwitch:onFake');
  Ref.$onFake = U => { onFake(Y, Ref) };
}
function build_super_comps (S) {
  S.tr4('build_super_comps');
  S.onFake = () => { onFake(S.un, S.Ref) };
  S.init = () => {
    const RUNS = () => {
      const RN = S.rack.get('RUNNERS');
      for (let [key, func] of S.tool.e(RN)) {
        S.tr3(`'${key}' started running.`);
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
    S.Ref.$unit = prepare_child_comps(S.un, Ref);
    S.Ref.$onFake = () => {};
    S.init = false;
  };
}
function build_guest_comps (G) {
  G.tr4('build_guest_comps');
  const RUNS = () => {};
  const DISP = (ON, Func) => {
    build_guest_dispatch(G, ON, Func);
  };
  build_base_comps(G, RUNS, DISP);
  G.runners('twtich', G.connect);
  G.Ref.$unit = U => {
    U.say = G.say;
    U.toDiscord = (...args) =>
        { return G.Ref.toDiscord(U, ...args) };
  };
}
function build_base_comps (X, RUNS, DISP) {
  X.tr4('build_base_comps');
  const c = X.im.chat;
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
      X.tr(`[Connect] Twitch Chat:${addr}:${port} (${STATE})`);
    });
    let CM;
    if (CM = ON.twitch_chat_message)
          CLIENT.on('message', DISP(ON, CM));
    await CLIENT.connect();
    X.tr3('Twitch login status', c.loginID, c.tagetChannels);
    X.tr7('password: ' + c.oauthToken);
    return CLIENT;
  };
  X.disconnect = () => {
    if (! CLIENT) return;
    try { CLIENT.disconnect() }
    catch (e) { X.tr('Warning (disconnect)', e) };
    CLIENT = false;
    X.tr3('disconnect');
  };
  X.client = async () => { return X.connect() };
  if (X.rack.has('Discord')) {
    X.Ref.toDiscord = async (U, ch, name, msg) => {
      const Key = `twitch.channels.${CH(X, ch)}.toDiscord`;
      X.tr3('toDiscord', Key);
      let cf;
      await U.root.sysDB().get(Key).then(x=> cf = x );
      if (! cf || ! cf.webhook) {
        U.tr4('toDiscord', 'Cancel( Unknown config )');
        return;
      }
      U.tr3('toDiscord:webhook');
      U.tr7('config', cf);
      const w = cf.webhook;
      U.root.Discord.webhook
            ([w.id, w.token], U.tool.tmpl(cf.message, {
          name: (name || '(N/A)'),
       message: (msg  || '...<None>')
      }));
    };
  } else {
    X.Ref.toDiscord = () => {};
  }
  X.Ref.$onFake = U => {};
  if (isSleep(X.un)) {
    X.tr4('onFake', true);
    onFake(X.un, Ref);
  }
  return X;
}
function prepare_child_comps (Y, Ref) {
  Y.tr4('prepare_child_comps');
  return U => {
    U.App = (name) => {
      const JS = require(`./Twitch/yta${name}.js`);
      return new JS (Y, U, Ref);
    };
    let [TMP, H] = [[]];
    U.start = async (ch, context, msg) => {
      U.tr4('start (:U)');
      H = context;
      const Uname = H['display-name'] || H.username || 'N/A';
       U.handler = () => { return context };
       U.channel = () => { return ch };
       U.content = () => { return msg };
      U.dispName = () => { return Uname };
      U.username = () => { return H.username };
      const Key = `twitch.channels.${CH(U, ch)}.chat`;
      U.tr4('start [check:ignore]');
      let cf;
      await U.root.sysDB().get(Key)
             .then(x=> cf = x || { ignoreNames: [] });
      U.tr4('<sysDB>...ignoreNames', cf.ignoreNames);
      const target = H.username.toLowerCase();
      if (cf.ignoreNames.find(o=> o == target)) {
        U.tr3('Message:ignore - hit', target);
        return U;
      }
      U.root.brain.isCall(msg);
      return U;
    };
    U.reply = async (msg) => {
      return H.say(Ref.MSG_WRAP(msg));
    };
    U.every = () => {
      U.tr3('every');
      U.toDiscord(U.channel(), U.dispName(), U.content());
      U.root.finish();
    };
    U.toDiscord =
        (...args) => { return Ref.toDiscord(U, ...args) };
    U.say = U.super.say;
  };
}
function build_super_dispatch (S, ON, Func) {
  S.tr4(`build_super_dispatch`);
  return (ch, h, msg, self) => {
    //	if (self) return; // bot call << This doesn't work
    S.tr3(`[event status]`, ch, msg, self);
    S.tr7('[context]', h);
    let R;
    S.un.start(my).then( async r => {
      R = r;
      return R.Twitch.start(ch, h, msg);
    }).then( U => {
      const is = R.brain.result();
      if (is.answer) {
        U.reply(Uname, U.Ref.MSG_WRAP(is.answer));
        U.toDiscord(ch, Uname, U.Ref.MSG_WRAP(is.answer));
        return R.finsh();
      }
      if (! is.post) return R.finish();
      return Func(U, is);
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
  X.tr4('Twitch:onFake');
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
