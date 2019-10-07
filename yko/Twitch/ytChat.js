'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ytChat.js';
const ver = `yko/Twitch/${my} v191007.01`;
//
module.exports.Super = function (Y, Sp, Cd) {
  const S = this;
  S.ver  = `${ver} :S`;
  S.conf = Sp.conf.chat;
  S.im   = Sp.im.chat;
  S.parent = S.boss = Sp;
  build_super_component(Y, S, Cd);
  S.say = Cd.comps.say;
}
module.exports.Unit = function (Y, Up, Cd) {
  const U = this;
  U.ver  = `${ver} :U`;
  U.conf = Up.conf.chat;
  U.im   = Up.im.chat;
  U.unit = Up.unit;
  U.parent = U.boss = Up;
  Cd.$unit(Y, U, Cd);
  Cd.$onFake(Y, U, Cd);
  U.toDiscord = Cd.comps.toDiscord(U.unit);
}
module.exports.init = function (Y, Sp, Cd) {
  this.im = Sp.im.chat;
  build_base_comp(Y, this, Cd);
  create_unit_func(Y, Cd);
}
module.exports.onFake = function (Y, Sp, Cd) {
}
function build_super_component (Y, S, Cd) {
  S.init = () => {
    const comps = build_base_comp(Y, S, Cd);
    build_super_comp_next(Y, S, comps, Cd);
    create_unit_func(Y, Cd);
    Y.on('Rollback', comps.disconnect);
    S.init = false;
  }
}
function build_base_comp (Y, xx, Cd) {
  const comps = Cd.comps = Y.tool.c(null);
  comps.tmi = () => {
    const TMI = require('tmi.js');
    return new TMI.client({
      identity: {
        username: im.loginID,
        password: im.oauthToken
      },
      channels: im.tagetChannels
    };
  };
  comps.say = (ch, msg) => {
    comps.connect().then( async o => {
      o.say(ch, msg);
      return o;
    });
  });
  const ON = Y.rack.get('ON');
  for (let k of ['connected', 'ignoreAction']) {
    if (! ON[`twitch_chat_${k}`])
    ON[`twitch_chat_${k}`] = () => {};
  }
  const CM = ON.twitch_chat_message;
  if (! CM) Cd.imGuest = true;
  let CLIENT;
  comps.connect = async () => {
    if (CLIENT) return CLIENT;
    CLIENT = comps.tmi();
    CLIENT.on('connected', (addr, port) => {
      ON.twitch_chat_connected(addr, port);
      Y.tr(`[[[ Connect ... Twitch Chat:${addr}:${port} ]]]`);
    });
    if (CM) {
      Cd.MSG_WRAP = Y.debug() ? (msg) => {
        return `${msg} (Debug)`;
      }: (msg) => { return msg };
      Y.tr3("ON ... 'twitch_chat_message'");
      CLIENT.on('message', build_dispatch(Y, CM));
    }
    await CLIENT.connect();
    Y.tr3('Twitch login status',
           xx.im.loginID, xx.im.tagetChannels );
    Y.tr7('password: ' + xx.im.oauthToken);
    return CLIENT;
  };
  comps.disconnect = () => {
    if (! CLIENT) return;
    try { CLIENT.disconnect() }
    catch (e) { Y.tr('disconnect: Warning', e) };
    CLIENT = false;
    Y.tr3('disconnect');
  };
  comps.start = (U, ch, h, msg) => { return {
       next : true,
    channel : ch,
     handle : h,
    message : msg
  } };
  return comps;
}
function build_super_comp_next (Y, S, comps, Cd) {
  const T = Y.tool;
  comps.App = (name, args) => {
    const Js = require(`./App/yta${name}.js`);
    return new Js (y, u, args);
  };
  let U;
  comps.start = async (u, ch, h, msg) => {
    U = u;
    const Uname = h['display-name'] || h.username || 'N/A';
    U.handler  = () => { return h };
    U.channel  = () => { return ch };
    U.content  = () => { return msg };
    U.dispName = () => { return Uname };
    U.username = () => { return h.username };
    let cf;
    await U.unit.sysDB().cash
      (['twitch', 'channels', filter(T, ch), 'chat'])
      .then( c => { cf = c.value || { Empty: true } });
    Y.tr6('twitch-config-data', cf);
    const target = T.A2a(U.dispName());
    Y.tr4('Message:ignore - target', check);
    Y.tr4('Message:ignore - list', cf.ignoreNames);
    if (cf.ignoreNames
      && cf.ignoreNames.find(o=> o == check)) {
      Y.tr3('Message:ignore - hit', check);
      U.unit.finish();
      return {};
    }
    const is = U.unit.brain.isCall(msg);
    if (is.answer) {
      U.reply(Uname, Cd.MSG_WRAP(is.answer));
      U.toDiscord(ch, Uname, Cd.MSG_WRAP(is.answer));
      return {};
    }
    is.next = true;
    return is;
  };
  comps.reply = (msg) => {
    const H = U.handler();
    if (H) return H.say(Cd.MSG_WRAP(msg));
    return U.say(U.channel(), msg);
  };
  comps.every = (is) => {
    U.toDiscord
      (U.unit, U.channel(), U.dispName(), U.content());
    U.unit.finish();
  };
  Cd.toDiscord = (X) => {
    return async (ch, uname, msg) => {
      Y.tr3('toDiscord');
      let chName = filter(T, ch);
      let cf;
      await X.sysDB()
        .cash(['twitch', 'channels', chName, 'toDiscord'])
        .then( c => { cf = c.value });
      Y.tr4('toDiscord', 'check');
      if (! cf || ! cf.webhook) {
        Y.tr4('toDiscord', 'Cancel( Unknown config )');
        return;
      }
      Y.tr6('toDiscord', cf);
      const w = c.webhook;
      Y.tr6('toDiscord - webhook', w);
      X.Discord
        .webhook([w.id, w.token], T.tmpl(cf.message, {
          name : (uname || '(N/A)'),
       message : (msg   || '...<None>')
      }));
    };
  };
  return comps;
}
function build_engine (Y, S, Cd) {
  const ENGINE = () => {
    try {
      Cd.comps.connect();
    } catch (err) {
      Y.tr('Twitch:Chat error:', err);
      setTimeout(ENGINE, 10000);
    }
  };
  Y.engine(ENGINE);
  S.parent.run = () => {
    return Y.run(() => { return Cd.comps.connect() });
  };
}
function build_dispatch (Y, CM) {
  Y.tr2('build_dispatch');
  const T = Y.tool;
  return (ch, h, msg, self) => {
    //	if (self) return; // bot call << This doesn't work
    Y.tr3(`event status`, `"${ch}", "${self}", "${msg}"`);
    Y.tr7('context', h);
    let X;
    Y.start(my).then( async x => {
      X = x;
      const U = X.Twitch.Chat;
      const is = U.start(U, ch, h, msg);
      if (is.next) CM(U, is);
    }).catch(e=> {
      if (X) X.rollback();
      Y.throw(ver, e);
    });
  };
}
function create_unit_func (Y, Cd) {
  Cd.$unit = (U) => {
    for (let [key, func] of Y.tool.e(Cd.comps))
      { U[key] = func }
  }
}
function filter (T, channel) {
  return T.A2a
  (channel.match(/^\#(.+)/) ? RegExp.$1 : channel);
}



module.exports = function (y, p) {
  //
  S.preparFake = () => {
    Y.tr3('preparFake');
    const FAKE = require('./yChatFAKE.js');
    S.tmi = () => { return new FAKE (Y, S) };
  };
  if (Y.debug() && S.im.sleep) S.preparFake();
};
function initBOX (box) {
  box.set('createTimeStamp', Y.tool.unix());
  box.set('LimitData', {}); // name:{ limit:(unix), value:(...) }
  return box;
}
function cleanBox () {
  if (! S.box) Y.throw(`'S.box' is not create`);
  const Now = Y.tool.unix();
  const Box = S.box.get('LimitData');
  for (let [k, v] of Object.entries(Box)) {
    if (! v.limit || v.limit < Now) delete Box[k];
  }
  return S.box.set('LimitData', Box);
}
