'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'TOOL.js';
const ver = `yko/${my} v191031`;
//
const TM_FORMAT = '/DD HH:mm:ss';
let tr = console.log,
 Throw = (...arg) => { throw arg.join(', ') };
//
module.exports = function () {
  const T = this;
  T.ver = ver;
  //
T.a = (x, z) => { return Object.assign(x, z) };
   T.c = (o) => { return Object.create(o)    };
   T.k = (o) => { return Object.keys(o)      };
   T.v = (o) => { return Object.values(o)    };
   T.e = (o) => { return Object.entries(o)   };
  //
        T.moment = () => { return MOMENT };
          T.util = util;
            T.fs = fs;
      T.kuromoji = kuromoji;
        T.crypto = T.crypt = crypto;
      T.encodeJP = encodeJP;
          T.util = util;
       T.counter = counter;
       T.inspect = inspect;
  //
           T.utc = utc;
          T.unix = unix;
      T.unix_add = unix_add;
     T.unix_form = unix_form;
     T.time_form = time_form;
  //
         T.canon = canonical;
            T.p0 = p0;
           T.z2h = z2h;
           T.A2a = A2a;
           T.a2A = a2A;
          T.Zcut = Zcut;
        T.countZ = countZ;
        T.encode = encode;
  //
      T.sec2form = sec2form;
      T.min2form = min2form;
          T.tmpl = tmpl;
  //
      T.txt2json = txt2json;
      T.json2txt = json2txt;
  //
        T.FSread = FSread;
       T.FSwrite = FSwrite;
      T.FSappend = FSappend;
      T.FSunlink = FSunlink;
    T.FSreadJson = FSreadJson;
   T.FSwriteJson = FSwriteJson;
  //
        T.hasKey = hasKey;
       T.isArray = isArray;
   T.isHashArray = isHashArray;
      T.isObject = isObject;
      T.isNumber = isNumber;
         T.isStr = isString;
      T.isString = isString;
  T.isStringEasy = isStringEasy;
         T.clone = clone;
         T.reset = reset;
         T.quest = quest;
          T.Sort = Sort;
       T.revSort = revSort;
  //
       T.shuffle = shuffle;
      T.push2cut = push2cut;
     T.array2cut = array2cut;
  //
       T.digest  = digest;
       T.encrypt = encrypt;
       T.decrypt = decrypt;
    T.makeTicket = makeTicket;
       T.ini2hex = ini2hex;
  //
  T.Try  = Try;
  T.init = (Y) => {
       tr = Y.tr;
    Throw = Y.throw; 
    return T;
  };
};
//
const JS = Object.create(null);
function moment ()
{ return JS.moment || (JS.moment = require('moment')) }
function fs ()
{ return JS.fs || (JS.fs = require('fs')) }
function kuromoji ()
{ return JS.kmoji || (JS.kmoji = require('kuromoji')) }
function crypto ()
{ return JS.crypt || (JS.crypt = require('crypto')) }
function encodeJP ()
{ return JS.enc || (JS.enc = require('encoding-japanese')) }
function util ()
{ return JS.util || (JS.util = require('util')) }
//
let COUNT = 0;
function counter () {
  return ++COUNT <= 100000 ? COUNT: (COUNT = 1);
}
function inspect (...a) {
  return util().inspect(...a);
}
function digest (str) {
  return Try(()=> {
    let hash = crypto().createHash('sha256')
    hash.update(str, 'utf8');
    return hash.digest('base64');
  });
}
function encrypt (str, salt) {
  let secret;
  return Try(() => {
    let cip = crypto().createCipher('aes256', salt);
    secret = cip.update(str, 'utf8', 'hex');
    return (secret + cip.final('hex'));
  });
}
function decrypt (sec) {
  let str;
  return Try(() => {
    let crypt = require('crypto');
    let dec = crypt.createDecipher('aes256', salt);
    str = dec.update(sec,'hex','utf8');
    return (str + dec.final('utf8'));
  });
}
function makeTicket () {
  return ini2hex(utc());
}
function ini2hex (i) {
  return Number(i).toString(16).toUpperCase();
}
function utc () {
  return (new Date()).getTime();
}
function unix (t) {
  return t ? moment().unix(t) : moment()().unix();
}
function unix_add (n, o) {
  if (! n) Throw(`${ver} Losing argument.`);
  return moment()().add(n, (o || 'm')).unix();
}
function unix_form (n, f) {
  if (! n) Throw(`${ver} Losing argument.`);
  return moment().unix(Number(n)).format(f || TM_FORMAT);
}
function time_form (n, f) {
  return moment()
    (n ? Number(n): undefined).format(f || TM_FORMAT);
}
function canonical (v) {
  if (!v) return '';
  return String(v).replace(/\r?\n/g, '')
  .replace(/\s+/g, ' ').trim() || '';
}
function p0 (n, l) {
  if (! l) l = 2;
  return ( Array(l).join('0') + n ).slice(-l);
}
function z2h (s) {
  if (! s) return '';
  s = s.replace(/[Ａ-Ｚａ-ｚ０-９！-～]/g, o => {
    return String.fromCharCode(o.charCodeAt(0) - 0xfee0);
  });
  return s.replace(/”/g, '"') .replace(/’/g, "'")
  .replace(/‘/g, '`') .replace(/￥/g, '\\') .replace(/　/g, ' ');
}
function A2a (s) {
  return s ? s.toLowerCase(): '';
}
function a2A (s) {
  return s ? s.toUpperCase(): '';
}
function Zcut (str, n, ident) {
  if (! n) Throw(`${ver} Insufficient arguments.`);
  str = canonical(str);
  let [b, result] = [0, ''];
  for (let v of Object.values( str.split('') )) {
    v.match(/[\!-\~ ]/) ? ++b : (b += 2);
    if (b <= n) result += v;
  }
  if (ident && b > n) result += ident;
  return result;
}
function countZ (str) {
  str = canonical(str);
  let b = 0;
  for (let v of Object.values( str.split('') ))
  { v.match(/[\!-\~ ]/) ? ++b : (b += 2) }
  return b;
};
function sec2form (n) {
  let str;
  if (Number(n) > 60) {
    let hh, mm, ss;
    mm = Math.floor(n / 60);
    ss = (n % 60);
    if (mm > 60) {
      str = Math.floor(mm / 60) + '時間'
      + this.p0(mm % 60) + '分' + p0(ss) + '秒';
    } else {
      str = mm + '分' + this.p0(ss) + '秒';
    }
  } else {
    str = n + '秒';
  }
  return str;
}
function min2form (n) {
  let str;
  if (Number(n) > 60) {
    str = Math.floor(n / 60) + '時間' + p0(n % 60) + '分';
  } else {
    str = n + '分';
  }
  return str;
}
function FSread (path, cr, err) {
  return Try(() => { return fs()
  .readFileSync(path, ENC(cr)) }, (err || false));
}
function FSwrite (path, value, cr, err) {
  return Try(() => { return fs()
  .writeFileSync(path, value, ENC(cr)) }, (err || false));
}
function FSappend (path, value, cr, err) {
  return Try(() => { return fs()
  .appendFileSync(path, value, ENC(cr)) }, (err || false));
}
function FSreadJson (path, cr, err) {
  return txt2json(FSread(path, cr, err));
}
function FSwriteJson (path, json, cr, err) {
  return FSwrite(path, json2txt(json), cr, err);
}
function FSunlink (path) {
  let status;
  try { fs().unlinkSync(path); status = true }
  catch (err) { status = false; tr('[TOOL] FSunlink', err) }
  return status;
}
function txt2json (txt) {
  try { return JSON.parse(txt) } catch (e) {
    tr(`[TOOL] Warning Error:`, e);
    return Object.create(null);
  }
}
function json2txt (json) {
  try { return JSON.stringify(json, null, '  ') }
  catch (e) {
    tr(`[TOOL] Warning Error:`, e);
    return Object.create(null);
  };
}
function hasKey (o, key) {
  return (isHashArray(o) && (key in o));
}
function isArray (o) {
  return ((o instanceof Object) && (o instanceof Array));
}
function isHashArray (o) {
  return ((o instanceof Object) && ! (o instanceof Array));
}
function isObject (o) {
  return (o && typeof o == 'object');
}
function isString (o) {
  return (typeof o == 'string');
}
function isStringEasy (o) {
  return (o == null || o == undefined || typeof o == 'string');
}
function isNumber (o) {
  return ((o || o === 0) && Number.isInteger(o));
}
function isFunction (o) {
  return (o && typeof o == 'function');
}
function clone (o) {
  return Object.assign(Object.create(null), o);;
}
function reset (o) {
  for(let key in o){ delete o[key] }
}
function quest (v, keys) {
//  tr('[TOOL] quest', keys);
  if (! keys) return v;
  if (! isArray(keys)) keys = keys.trim().split(/\s*\.\s*/);
  for (let k of keys) {
//		if (! k in v) return undefined;
    if (v[k] === undefined) return undefined;
    v = v[k];
  }
  return v;
}
function shuffle (a) {
  for (let i = a.length - 1; i > 0; i--) {
    let r = Math.floor(Math.random() * (i + 1));
    let tmp = a[i];
    a[i] = a[r];
    a[r] = tmp;
  }
  return a;
}
function push2cut (b, i, n) {
  b.push(i);
  return array2cut(b, n);
}
function array2cut (b, n) {
  if (! n || n < 2) Throw(`${ver} Abnormal argument.`);
  if (b.length > n) b.splice(0, (b.length - n));
  return b;
}
function encode (buf, result) {
  if (! result) { result =
    (c, t, b) => { return { char:c, text:c, invalid:b } };
  }
  const Char = encodeJP().detect(buf); // || 'UTF8';
  if (! Char || Char == 'BINARY')
    { return result(Char, buf, true) }
  if ( Char == 'UNICODE' || Char == 'UTF8'
    || Char == 'UTF32'   || Char == 'ASCII' )
    { return result(Char, buf.toString(), false) }
  const Text = encodeJP().convert
    (buf, { to: 'UNICODE', from: Char, type: 'string' });
  return result(Char, Text, false);
}
function tmpl (tmpl, obj) {
  if (! tmpl) Throw(`${ver} Unknown template.`);
  let REG;
  if (isArray(tmpl)) { [REG, tmpl] = tmpl }
  else { REG = /<\s*([^<>\r\n\t]+)\s*>/g }
  if (! obj ) obj  = Object.create(null);
  const FUNC = isFunction(obj) ? obj : (tmp, x) => {
    let [o, args] = [obj, []];
    let fr = x = x.trim();
    if (fr.match(/([^\(]+)\s*\(\s*([^\)]+)\s*\)/)) {
      [fr, args] = [RegExp.$1.trim(), RegExp.$2];
      args = args.trim().split(/\s*\,\s*/);
    }
    for (let key of fr.split(/\s*\.\s*/)) {
      o = hasKey(o, key) ? o[key] : tmp;
      if (isFunction(o)) return o(...args);
      if (! isObject(o)) return o;
    }
    return tmp;
  };
  return tmpl.replace(REG, FUNC);
}
function Sort    (o) { return _SORT_(o, -1,  1) }
function revSort (o) { return _SORT_(o,  1, -1) }
function _SORT_ (o, n1, n2) {
  o.sort((a, b) => {
    if (a.no < b.no) return n1;
    if (a.no > b.no) return n2;
    return 0;
  });
  return o;
}
function Try (Func, Err) {
  if (! Err) Err = () => { return false };
  try { return Func() }
  catch (e) { return Err(e) };
}
