'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'yHTTP.js';
const ver = `yko/${my} v191108`;
//
  const Enc = 'utf8',
  RestartIv = 15000,
 ListenPort =  8000,
  SocketTTL =  4000,
    DataMax = (3* 1024* 1024),
ContentJSON = `application/json; charset=utf-8`,
ContentTYPE = `text/html; charset=utf-8`,
   URL = require('url'),
  HTTP = require('http'),
 QUERY = require('querystring');
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
module.exports.initFake = function (Y, Ref) {
};
function build_super_comp (S) {
  S.init = () => {
    build_base_comp(S, () => {
      for (let [key, func] of S.tool.e(S.runners())) {
        S.tr3(`[HTTP] '${key}' started running.`);
        func();
      }
    });
    const ENGINE = () => {
      try {
        S.server();
      } catch (err) {
        S.close();
        S.tr('[HTTP] Warning', err);
        setTimeout(ENGINE, RestartIv);
      }
    };
    S.engine(ENGINE);
//    S.on('rollback', S.close);
    S.init = false;
  };
}
function build_unit_comp (U) {
  const R = U.root,
        T = U.tool;
  U.json = new responceJSON (U, T);
  U.Api = (name) => {
    const JS = require(`./HTTP/yha${name}.js`);
    return new JS.Unit (U);
  };
  let req, res, Delay, Finish;
  U.start = (q, s) => {
    U.request  = req = q;
    U.responce = res = s;
    return U;
  };
  U.delay = () => { Delay = true; return U };
  U.final = (code) => {
    Delay = false;
    return $finish_(code);
  };
  U.finish = $finish_;
  function $finish_ (code) {
    if (Finish || Delay || R.finished()) return;
    Finish = true;
    U.tr3(`[HTTP] responce status:`, code);
    return (code && code == 200) ? R.finish(): R.away();
  }
  let ReqURL;
  U.reqURL = () => {
    return ReqURL || (() => {
      let url = (req.url || '')
             .replace(/\/index\.[^\/\.]+/i, '/');
      U.tr3(`[HTTP] reqURL`, url);
      if (url == '/') { U.responceHello(); url = null }
      return (ReqURL = url);
    }) ();
  };
  U.reqMethod = () => { return req.method };
  U.statusCode = (code) =>
    { return code ? (res.statusCode = code): res.statusCode };
  U.statusMessage = (msg) =>
    { return msg ? (res.statusMessage = msg): res.statusMessage };
  U.setHeader = (name, value) =>
    { return res.setHeader(name, value) };
  //
  U.responceHello = () => {
    return U.json.success
      ({ body: 'Hello !!' }).send().then(x=> $finish_(x));
  };
  U.responceSuccess = (o) => {
    return U.json.success
      (o || {}).send().then(x=> $finish_(x));
  };
  U.responceAny = (code, o) => {
    return U.json.any
      ((code || 500), (o || {})).send().then(x=> $finish_(x));
  };
  U.responceNotFound = (o) => { return U.responceAny(404, o) };
U.responceBatRequest = (o) => { return U.responceAny(400, o) };
 U.responceForbidden = (o) => { return U.responceAny(403, o) };
     U.responceError = (o) => { return U.responceAny(500, o) };
  //
  const DATA = { read: '' };
  U.parseGET = async () => {
    U.tr3('[HTTP] GET');
    return URL.parse(req.url, true).query || {};
  };
  U.parsePOST = () => {
    U.tr3('[HTTP] parsePOST');
    return $readData_().then(d=> {
      return d.ref ? QUERY.parse(d.ref): {};
    });
  };
  U.parseJSON = () => {
    U.tr3('[HTTP] parseJSON');
    return $readData_().then(d=> {
      if (! d.ref) return {};
      try {
        d.json = T.txt2json(d.ref);
        delete d.ref;
      } catch (e) {
        d.error = e;
      }
      return d;
    });
  };
  U.parseBODY = () => {
    U.tr3('[HTTP] parseBODY');
    return $readData_();
  };
  function $readData_ () {
    return new Promise ((resolve, reject) => {
      if (DATA.ref) return resolve(DATA);
      req.on('data', chunk => {
        DATA.read += chunk;
        if ($OverFlow_(DATA))
          return reject({ overFlow: true });
      });
      req.on('end', () => {
        U.tr7(`[HTTP:readData] end`, DATA.read);
        DATA.ref = DATA.read;
        delete DATA.read;
        return resolve(DATA);
      });
    });
  }
  function $OverFlow_ (d) {
    if (d.read.length < DataMax) return false;
    U.tr3('[HTTP] Warning: !!! DATA OverFlow !!!');
    d.read = '';
    U.responceAny(413); // Payload Too Large.
    return true;
  }
}
function responceJSON (U, T) {
  const J = this;
  function setHeader (code, headers) {
    const msg = HTTP.STATUS_CODES[code || (code = 500)]
             || HTTP.STATUS_CODES[code = 500];
    U.statusCode(code);
    U.statusMessage(msg);
    U.setHeader('Content-Type', ContentJSON);
    for (let [name, value] of T.e(headers))
        { U.setHeader(name, value) }
    return {
      statusCode: code,
   statusMessage: msg,
     ContentType: ContentJSON,
    };
  };
  J.success = (body, headers) => {
    J.body = {
      ...body,
      ...(setHeader(200, (headers || {}))),
      result: 'Success',
      Success: true
    };
    return J;
  };
  J.any = (code, body, headers) => {
    J.body = {
      ...body,
      ...(setHeader(code, (headers || {}))),
      Success: false
    };
    return J;
  };
  J.content = (body) => {
    if (! J.body) U.throw(`[HTTP:JSON] body is not created.`);
    return T.json2txt({ ...(J.body), ...(body || {}) });
  };
  J.send = (body) => {
    return new Promise ((resolve, reject) => {
      if (U.Sended) {
        U.tr3(`[HTTP] send`, '!! Recursive call !!');
        return reject(0);
      }
      U.tr3(`[HTTP] send:`);
      U.responce.end(J.content(body));
      U.Sended = true;
      return resolve(U.statusCode());
    });
  };
}
function build_init_comp (S) {
  build_base_comp(S, () => {});
//  S.on('rollback', S.close);
	S.on('runners', 'HTTP', S.server);
}
function build_base_comp (X, RUNS) {
  const ON = X.rack.get('ON');
  const Socks = new Map([]),
         Port = (X.conf.port      || ListenPort),
      SockTTL = (X.conf.socketTTL || SocketTTL ),
       Action = ON.http_responce || (() => { return false });
  let SRV, ports = 0;
  X.server = () => {
    return new Promise ((resolve, reject) => {
      if (SRV) return resolve(SRV);
      const server = HTTP.createServer();
      server.on('request', build_api(X, Action));
      server.on('connection', socket => {
        const Id = ++ports > 10000 ? (ports = 1): ports;
        Socks.set(Id, socket);
        X.tr4(`[HTTP] socket = opened: ${Id}`);
        socket.on('close', () => {
          X.tr4(`[HTTP] socket - closed: ${Id}`);
          Socks.delete(Id);
        })
        socket.setTimeout(SockTTL);
      });
      server.listen(Port, () => {
        X.tr(`[HTTP] Started !! port:${Port}`);
        return resolve(SRV = server);
      });
    });
  };
  X.close = () => {
    if (SRV) {
      SRV.close();
      for (let id in Socks) {
        X.tr4(`[HTTP] socket - destroyed: ${id}`);
        Socks[id].destroy();
        Socks.delete(id);
      }
      [SRV, ports] = [false, 0];
      X.tr(`[HTTP] !! CLOSE !!`);
    } else {
      X.tr(`[HTTP] close: Server is Not Active.`);
    }
    return X;
  };
}
function build_api (X, Action) {
  const cmdReg = '[A-Z0-9\\-\\_]+';
  const isReg = new RegExp
        (`^/(${cmdReg})\.(${cmdReg})\/([^\/]+)`);
  return (req, res) => {
    let R;
    X.start(my).then(unitRoot=> {
      R = unitRoot;
      req.setEncoding(Enc);
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
      return R.HTTP.start(req, res);
    }).then(U => {
      const Url = U.reqURL();
      if (! Url) return false;
      U.is = Url.match(isReg) ? {
          Url: Url,
        ident: RegExp.$1,
          cmd: RegExp.$2,
        token: RegExp.$3
      }: {
          Url: Url
      };
      return Action(U, U.is);
    })
    .catch(err => {
      if (R) R.HTTP.responceError();
      X.throw('[HTTP]', err);
    });
  };
}
