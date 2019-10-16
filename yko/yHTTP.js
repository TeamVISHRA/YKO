'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'yHTTP.js';
const ver = `yko/${my} v191016`;
//
 const Enc = 'utf8',
 RestartIv =  15000,
ListenPort =   8000,
 SocketTTL =   4000,
   DataMax = (3* 1024* 1024),
   Content = `application/json; charset=utf-8`,
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
module.exports.onFake = function (Y, Ref) {
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
    S.on('rollback', S.close);
    S.init = false;
  };
}
function build_unit_comp (U) {
  let req, res;
  U.start = (q, s) => {
    U.request  = req = q;
    U.responce = res = s;
        U.json = U.tool.c(null);
    return U;
  };
  U.api = (name) => {
    const JS = require(`./API/yha${name}.js`);
    return new JS.Unit (U);
  };
     U.reqURL = () => { return req.url };
  U.reqMethod = () => { return req.method };
     U.status = () => { return res.statusCode };
   U.setError = () => { res.statusCode = 500 }; // Internal Err.
  U.setReject = () => { res.statusCode = 400 }; // Bat Request.
  U.setUnAuth = () => { res.statusCode = 403 }; // Forbidden.
 U.setUnknown = () => { res.statusCode = 404 }; // Not Found.
  let Header;
  U.setHeader = (code, head) => {
    if (code) {
      res.statusCode = code;
    } else if (! res.statusCode) {
      res.statusCode = 200; // OK
    }
    res.setHeader('Content-Type', (Header = head || Content));
  };
  U.send = async (code, head) => {
    if (code || ! Header) U.setHeader(code, head);
    res.end( U.tool.json2txt(U.json) );
    U.root.finish();
    U.send = false;
  };
  U.parseBODY = () => {
    
  };
  U.parseGET = () => {
    U.GET = URL.parse(req.url, true).query || U.tool.c(null);
    U.parseGET = false;
  };
  U.parsePOST = () => {
    if (req.method === 'POST') {
      let body = '';
      req.on('readable', chunk => {
        body += req.read();
        if (body.length > DataMax) {
          body = '';
          U.root.rollback();
          U.json = {
            statusCode: 400,
         statusMessage: 'Bat Request.'
          };
          U.send(U.json.statusCode);
          return (U.parsePOST = false);
        }
      });
      U.POST = QUERY.parse(body);
    } else {
      U.POST = U.tool.c(null);
    }
    return (() => {
      U.parsePOST = false;
      return true;
    }) ();
  };
  U.hello = () => {
    U.json = {
      statusCode: 200,
    statusMessge: 'OK',
     ContentType: Content,
            body: 'Hello !!'
    };
    U.send();
  };
}
function build_init_comp (S) {
  build_base_comp(S, () => {});
  S.on('rollback', S.close);
	S.on('runners', 'HTTP', S.server);
}
function build_base_comp (X, RUNS) {
   const ON = X.rack.get('ON'),
      Socks = new Map([]),
       Port = (X.conf.port      || ListenPort),
    SockTTL = (X.conf.socketTTL || SocketTTL );
  if (! ON.http_api_action)
  X.throw(`[HTTP] Please setup 'http_api_action')"`);
  let SRV, count = 0;
  X.server = () => {
    if (SRV) return SRV;
    SRV = HTTP.createServer();
    SRV.on('request', build_api(X, ON.http_api_action));
    SRV.on('connection', socket => {
      const Id = ++count;
      Socks.set(Id, socket);
      X.tr4(`[HTTP] socket = opened: ${Id}`);
      socket.on('close', () => {
        X.tr4(`[HTTP] socket - closed: ${Id}`);
        Socks.delete(Id);
      })
      socket.setTimeout(SockTTL);
    });
    SRV.listen(Port, () => {
      X.tr(`[HTTP] Started !! port:${Port}`);
    });
    return SRV;
  };
  X.close = () => {
    if (SRV) {
      SRV.close();
      for (let id in Socks) {
        X.tr4(`[HTTP] socket - destroyed: ${id}`);
        Socks[id].destroy();
        Socks.delete(id);
      }
      count = 0;
      SRV = false;
    }
    X.tr(`[HTTP] << CLOSE >>`);
  };
}
function build_api (X, Func) {
  return (req, res) => {
    let R;
    X.start(my).then(unitRoot=> {
      R = unitRoot;
      req.setEncoding(Enc);
      Func( R.HTTP.start(req, res) );
    }).catch(err => {
      res.statusCode = 500;
      res.end(X.tool.json2txt({
           statusCode: 500,
        statusMessage: 'Internal Server Error'
      }));
      if (R) R.rollback();
      X.throw(ver, err);
    });
  };
}
