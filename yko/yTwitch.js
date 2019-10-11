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
      const S = this;
        S.ver = `${ver} :S`;
	     S.conf = Y.conf.twitch;
         S.im = Y.im.twitch;
        S.Ref = Ref;
  S.DebugCall = DebugCall(Y, S);
  build_super_comps(Y, S, Ref);
}
module.exports.Unit = function (Y, R, Ref) {
  const U = this;
    U.ver = `${ver} :U`;
   U.root = R;
	 U.conf = Y.conf.twitch;
     U.im = Y.im.twitch;
    U.Ref = Ref;
  Ref.$unit   (U);
  Ref.$onFake (U);
}
module.exports.init = function (Y, Ref) {
  const G = this;
  G.im = Y.im.twitch;
  G.conf = Y.conf.twitch;
  build_guest_comps(Y, G, Ref);
}
module.exports.onFake = function (Y, Ref) {
  Y.tr4('yTwitch:onFake');
  Ref.$onFake = U => { onFake(Y, Ref) };
}
function build_super_comps (Y, S, Ref) {
  Y.tr4('build_super_comps');
  S.onFake = () => { onFake(Y, Ref) };
  S.init = () => {
    const RUNS = () => {
      const RN = Y.rack.get('RUNNERS');
      for (let [key, func] of Y.tool.e(RN)) {
        Y.tr3(`'${key}' started running.`);
        func();
    } };
    const DISP = (ON, Func) =>
      { return build_super_dispatch(Y, S, ON, Func, Ref) };
    build_base_comps(Y, S, RUNS, DISP, Ref);
    const ENGINE = () => {
      try {
        S.connect();
      } catch (err) {
        Y.tr('Warning', err);
        setTimeout(ENGINE, 10000);
      }
      return S.client();
    };
    Y.engine(ENGINE);
    S.run = Y.run;
    Ref.$unit = prepare_child_comps(Y, Ref);
    Ref.$onFake = () => {};
    S.init = false;
  };
}
function build_guest_comps (Y, G, Ref) {
  Y.tr4('build_guest_comps');
  const RUNS = () => {};
  const DISP = (ON, Func) => {
    build_guest_dispatch(Y, G, ON, Func, Ref);
  };
  build_base_comps(Y, G, RUNS, DISP, Ref);
  Ref.$unit = U => {
    U.say = G.say;
    U.toDiscord =
        (...args) => { return Ref.toDiscord(U, ...args) };
  };
}
function build_base_comps (Y, X, RUNS, DISP, Ref) {
  Y.tr4('build_base_comps');
  const c = X.im.chat;
  Ref.MSG_WRAP = Y.debug()
      ? (msg) => { return `${msg} (Debug)` }
      : (msg) => { return msg };
  //
  Ref.tmi = () => {
    const TMI = require('tmi.js');
    return new TMI.client({
      identity: {
        username: c.loginID,
        password: c.oauthToken
      },
      channels: c.tagetChannels
    });
  };
  X.say = async (ch, name, msg) => {
    X.connect().then( async H => {
      return H.say(ch, name, Ref.MSG_WRAP(msg));
    });
  };
  const ON = Y.rack.get('ON');
  for (let k of ['connected', 'ignoreAction']) {
    const key = `twitch_chat_${k}`;
    if (! ON[key]) { ON[key] = () => {} }
    else { Y.tr3('init', `found: '${key}'`) }
  }
  let CLIENT;
  X.connect = async () => {
    if (CLIENT) return CLIENT;
    CLIENT = Ref.tmi();
    CLIENT.on('connected', (addr, port) => {
      RUNS();
      ON.twitch_chat_connected(addr, port);
      Y.tr(`[Connect] Twitch Chat:${addr}:${port} (${STATE})`);
    });
    let CM;
    if (CM = ON.twitch_chat_message)
          CLIENT.on('message', DISP(ON, CM));
    await CLIENT.connect();
    Y.tr3('Twitch login status', c.loginID, c.tagetChannels);
    Y.tr7('password: ' + c.oauthToken);
    return CLIENT;
  };
  X.disconnect = () => {
    if (! CLIENT) return;
    try { CLIENT.disconnect() }
    catch (e) { Y.tr('Warning (disconnect)', e) };
    CLIENT = false;
    Y.tr3('disconnect');
  };
  X.client = async () => { return X.connect() };
  if (Y.rack.has('Discord')) {
    Ref.toDiscord = async (U, ch, name, msg) => {
      const Key = `twitch.channels.${CH(Y, ch)}.toDiscord`;
      Y.tr3('toDiscord', Key);
      let cf;
      await U.root.sysDB().get(Key).then(x=> cf = x );
      if (! cf || ! cf.webhook) {
        Y.tr4('toDiscord', 'Cancel( Unknown config )');
        return;
      }
      Y.tr3('toDiscord:webhook');
      Y.tr7('config', cf);
      const w = cf.webhook;
      U.root.Discord.webhook
            ([w.id, w.token], Y.tool.tmpl(cf.message, {
          name: (name || '(N/A)'),
       message: (msg  || '...<None>')
      }));
    };
  } else {
    Ref.toDiscord = () => {};
  }
  Ref.$onFake = U => {};
  if (isSleep(Y)) {
    Y.tr4('onFake', true);
    onFake(Y, Ref);
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
      Y.tr4('start (:U)');
      H = context;
      const Uname = H['display-name'] || H.username || 'N/A';
       U.handler = () => { return context };
       U.channel = () => { return ch };
       U.content = () => { return msg };
      U.dispName = () => { return Uname };
      U.username = () => { return H.username };
      const Key = `twitch.channels.${CH(Y, ch)}.chat`;
      Y.tr4('start [check:ignore]');
      let cf;
      await U.root.sysDB().get(Key)
             .then(x=> cf = x || { ignoreNames: [] });
      Y.tr4('<sysDB>...ignoreNames', cf.ignoreNames);
      const target = H.username.toLowerCase();
      if (cf.ignoreNames.find(o=> o == target)) {
        Y.tr3('Message:ignore - hit', target);
        return U;
      }
      U.root.brain.isCall(msg);
      return U;
    };
    U.reply = async (name, msg) => {
      return H.say(name, Ref.MSG_WRAP(msg));
    };
    U.every = () => {
      Y.tr3('every');
      U.toDiscord(U.channel(), U.dispName(), U.content());
      U.root.finish();
    };
    U.toDiscord =
        (...args) => { return Ref.toDiscord(U, ...args) };
    U.say = Y.Twitch.say;
  };
}
function build_super_dispatch (Y, S, ON, Func, Ref) {
  Y.tr4(`build_super_dispatch`);
  return (ch, h, msg, self) => {
    //	if (self) return; // bot call << This doesn't work
    Y.tr3(`[event status]`, ch, msg, self);
    Y.tr7('[context]', h);
    let R;
    Y.start(my).then( async r => {
      R = r;
      return R.Twitch.start(ch, h, msg);
    }).then( U => {
      const is = R.brain.result();
      if (is.answer) {
        U.reply(Uname, Ref.MSG_WRAP(is.answer));
        U.toDiscord(ch, Uname, Ref.MSG_WRAP(is.answer));
        return R.finsh();
      }
      if (! is.post) return R.finish();
      return Func(U, is);
    }).catch(e=> {
      if (R) R.rollback();
      Y.throw(ver, e);
    });
  };
}
function CH (Y, ch) {
  return Y.tool.A2a(ch.match(/^\#(.+)/) ? RegExp.$1 : ch);
}
function onFake (Y, Ref) {
  Y.tr4('Twitch:onFake');
  STATE = 'Fake';
  Ref.tmi = () => {
    const JS = require(ytFake);
    return new JS.on (Y);
  };
}
function isSleep (Y) {
  if (Y.debug()) {
    STATE = 'Debug';
    if (Y.im.twitch.sleep) {
      Y.tr3('[Twitch] im Sleep !!');
      return true;
    }
  }
  return false;
}
function DebugCall (Y, S) {
  return () => {
    const [,, ...ARGV] = process.argv;
    if (ARGV.length < 1) return S;
    const Fake = require(ytFake);
    return Fake.call(Y, S, ARGV);
  };
}
