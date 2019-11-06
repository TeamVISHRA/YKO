'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'yHTTP.js';
const ver = `yko/${my} v191102`;
//
  const Enc = 'utf8',
  RestartIv =  15000,
 ListenPort =   8000,
  SocketTTL =   4000,
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
  const T = U.tool;
  let req, res;
  U.start = (q, s) => {
    U.request  = req = q;
    U.responce = res = s;
//        U.json = U.tool.c(null);
    return U;
  };
  U.Api = (name) => {
    const JS = require(`./HTTP/yhAPI_${name}.js`);
    return new JS.Unit (U);
  };
     U.status = () => { return res.statusCode };
  U.reqMethod = () => { return req.method };
  let ReqURL;
  U.reqURL = () => {
    return ReqURL || (() => {
      
      ReqURL = (req.url || '')
             .replace(/\/index\.[^\/\.]+/i, '/');
      U.tr3(`[HTTP] reqURL`, ReqURL);
      if (ReqURL == '/') { U.responceHello(); ReqURL = null }
      return ReqURL;
    }) ();
  };
  let ContentTYPE;
  U.contentType = (str) => {
    return str ? (ContentTYPE = str): str;
  };
  U.send = async (code, head, json) => {
    if (U.root.finished()) {
      U.tr3(`[HTTP] send`, 'Recursive call !!');
      return true;
    }
    U.tr3(`[HTTP] send`);
    if (code) { res.statusCode = code }
    else if (! res.statusCode) { res.statusCode = 200 }
    res.setHeader
         ('Content-Type', (head || ContentTYPE || ContentJSON));
    res.end( T.json2txt(json || U.json) );
    U.tr3
(`[HTTP] responce status:${res.statusCode}`, req.url, req.method);
  };
  let GET;
  U.parseGET = () => {
    U.tr3('[HTTP] GET');
    return GET || (GET = new Promise (resolve => {
      const get = URL.parse(req.url, true).query || T.c(null);
      return resolve(get);
    }));
  };
  let POST;
  U.parsePOST = () => {
    U.tr3('[HTTP] parsePOST');
    return U.getDATA().then( db => {
      return db.data ? QUERY.parse(db.data): false;
    }).catch(e=> U.throw(e));
  };
  let BODY;
  U.parseBODY = () => {
    U.tr3('[HTTP] parseBODY');
    return U.getDATA()
      .then( db => { return db }).catch(e=> U.throw(e));
  };
  let DATA;
  const OverFlow = (s) => {
    if (s.data.length < DataMax) return false;
    U.tr3('[HTTP] Warning: !!! DATA OverFlow !!!');
    s.data = null;
    U.responceBatRequest();
    return true;
  };
  U.getDATA = () => {
    U.tr3('[HTTP] getDATA');
    return DATA || (DATA = new Promise ((resolve, reject) => {
      const s = { data: '' };
      req.on('data', chunk => {
        s.data += chunk;
        if (OverFlow(s)) return reject('OverFlow');
      }).on('end', () => {
        U.tr4(`[HTTP] getDATA: end`, s.data);
        return resolve(s);
      });
    }));
  };
  const JsonBase = (code, msg) => {
    return {
      statusCode: code,
   statusMessage: msg,
     ContentType: ContentJSON,
    };
  };
  U.responceError = () => {
    U.json = JsonBase(500, 'Internal Server Error.');
    U.send(U.json.statusCode);
    U.root.rollback();
  };
  U.responceBatRequest = () => {
    U.json = JsonBase(400, 'Bat Request.');
    U.send(U.json.statusCode);
    U.root.rollback();
  };
  U.responceForbidden = () => {
    U.json = JsonBase(403, 'Forbidden.');
    U.send(U.json.statusCode);
    U.root.rollback();
  };
  U.responceNotFound = () => {
    U.json = JsonBase(404, 'Not Found.');
    U.send(U.json.statusCode);
    U.root.rollback();
  };
  U.responceSuccess = () => {
    U.json = JsonBase(200, 'OK');
    U.json.result  = 'Success';
    U.json.Success = true;
    U.send();
    U.root.finish();
  };
  U.responceHello = () => {
    U.json = JsonBase(200, 'OK');
    U.json.body = 'Hello !!';
    U.send();
    U.root.rollback();
  };
}
function build_init_comp (S) {
  build_base_comp(S, () => {});
//  S.on('rollback', S.close);
	S.on('runners', 'HTTP', S.server);
}
function build_base_comp (X, RUNS) {
   const ON = X.rack.get('ON'),
      Socks = new Map([]),
       Port = (X.conf.port      || ListenPort),
    SockTTL = (X.conf.socketTTL || SocketTTL );
  const Action = ON.http_responce
              || (async () => { return false });
  let SRV, count = 0;
  X.server = () => {
    if (SRV) return SRV;
    SRV = HTTP.createServer();
    SRV.on('request', build_api(X, ON, Action));
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
function build_api (X, ON, Action) {
  return (req, res) => {
    let R;
    X.start(my).then(unitRoot=> {
      R = unitRoot;
      req.setEncoding(Enc);
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
         const U = R.HTTP.start(req, res);
      const Docs = U.conf.HTDOC;
      const Url = U.reqURL();
      if (! Url) return false;
      if (Url.match(/^\/(WH|API)\/([^\/]+)\/([^\/]+)/)) {
        let [type, id, token, x] =
            [RegExp.$1, RegExp.$2, RegExp.$3];
        if (x = Docs[type]) {
          if (x = x[id]) {
            return R[x.name][type](U, token).then(x => {
              return x.success
                ? U.responceSuccess()
                : U.responceForbidden();
            }). catch(e=> {
              U.responceError();
              U.throw(`[HTTP] ${U.ver}`, e);
            });
          }
        }
      }
      Action(U, Url).then(x=> {
        if (! R.finished()) U.responceNotFound();
      });
    }).catch(err => {
      if (R && ! R.finished()) {
        R.rollback();
        res.statusCode = 500;
        res.end(X.tool.json2txt({
           statusCode: 500,
        statusMessage: 'Internal Server Error'
        }));
      }
      X.throw(ver, err);
    });
  };
}
