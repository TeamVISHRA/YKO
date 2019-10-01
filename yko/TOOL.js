//
// yko/TOOL.js
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'TOOL.js';
const ver = `yko/${my} v191001.01`;
//
const MOMENT = require('moment'),
        UTIL = require('util'),
   TM_FORMAT = '/DD HH:mm:ss';
//
let Y;
module.exports = function (y) {
  this.ver = ver; Y = y;
  const T = this;
  //
  T.moment   = MOMENT;
  T.fs       = fs;
  T.kuromoji = kuromoji;
  T.crypto   = T.crypt = crypto;
  T.encodeJP = encodeJP;
  //
  T.digest = digest;
  T.encrypt = encrypt;
  T.decrypt = decrypt;
  T.create_ticket = create_ticket;
  T.ini2hex = ini2hex;
  T.time_msec = time_msec;
  T.unix = T.time_u = unix;
  T.unix_add = unix_add;
  T.time_u_add = T.unix_add;
  T.unix_form = unix_form;
  T.time_u_form = T.unix_form;
  T.time_form = time_form;
  T.canonical = T.canon = canonical;
  T.p0  = p0;
  T.z2h = z2h;
  T.A2a = A2a;
  T.a2A = a2A;
  T.Zcut = Zcut;
  T.byte2cut = T.Zcut;
  T.countZ = T.zTwoCount = countZ;
  T.sec2form = sec2form;
  T.min2form = min2form;
  T.txt2json = T.j2obj  = txt2json;
  T.json2txt = T.o2json = json2txt;
  T.FSread  = T.fs_r = FSread;
  T.FSwrite = T.fs_w = FSwrite;
  T.FSappend = T.fs_a = FSappend;
  T.FSunlink = T.fs_unlink = FSunlink;
  T.FSreadJson = T.fs_r_json = FSreadJson;
  T.FSwriteJson = T.fs_w_json = FSwriteJson;
  T.inspect = UTIL.inspect;
  T.is_object = is_object;
  T.clone = clone;
  T.reset = reset;
  T.quest = quest;
  T.shuffle = shuffle;
  T.push2cut = push2cut;
  T.array2cut = array2cut;
  T.encode = encode;
  T.tmpl = tmpl;
  T.Try = Try;
  T.sleep = sleep;
};
//
const JS = {};
function fs ()
{ return JS.fs || (JS.fs = require('fs')) }
function kuromoji ()
{ return JS.kmoji || (JS.kmoji = require('kuromoji')) }
function crypto ()
{ return JS.crypt || (JS.crypt = require('crypto')) }
function encodeJP ()
{ return JS.enc || (JS.enc = require('encoding-japanese')) }
//
function digest (str) {
  let result;
  return Try([() => {
    var hash = crypto().createHash('sha256')
    hash.update(str, 'utf8');
    result = hash.digest('base64');
  }]) ? result : false;
}
function encrypt (str) {
  let secret;
  return Try([() => {
    let crypt = require('crypto');
    let cip = crypto().createCipher('aes256', salt);
    secret = cip.update(str, 'utf8', 'hex');
    secret += cip.final('hex');
  }]) ? secret : false;
}
function decrypt (sec) {
  let str;
  return Try([() => {
    let crypt = require('crypto');
    let dec = crypt.createDecipher('aes256', salt);
    str = dec.update(sec,'hex','utf8');
    str += dec.final('utf8');
  }]) ? str : false;
}
function create_ticket () {
  return ini2hex( time_form(0, 'YYYYMMDDmss') + time_msec() );
}
function ini2hex (i) {
  return Number(i).toString(16).toUpperCase();
}
function time_msec () {
  return moment().milliseconds();
}
function unix (t) {
  return t ? MOMENT.unix(t) : MOMENT().unix();
}
function unix_add (n, o) {
  if (! n) Y.throw(ver, 'Losing argument');
  return MOMENT().add(n, (o || 'm')).unix();
}
function unix_form (n, f) {
  if (! n) Y.throw(ver, 'Losing argument');
  return MOMENT.unix(n).format(f || TM_FORMAT);
}
function time_form (n, f) {
  return MOMENT(n || undefined).format(f || TM_FORMAT);
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
  if (! n) Y.throw(ver, 'Insufficient arguments');
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
  catch (err) { status = false, Y.tr2('FSunlink', err) }
  return status;
}
function txt2json (txt) {
  return JSON.parse(txt);
}
function json2txt (json) {
  return JSON.stringify(json, null, '  ');
}
function is_object (o) {
  return (o != null
  && ! Array.isArray(o) && typeof o == 'object');
}
function clone (o) {
  return Object.create(o);
}
function reset (o) {
  for(var key in o){ delete o[key] }
}
function quest (v, keys) {
  Y.tr3('quest', keys);
  for (let k of keys) {
//		if (! k in v) return undefined;
    if (v[k] === undefined) return undefined;
    v = v[k];
  }
  return v;
}
function shuffle (a) {
  for (var i = a.length - 1; i > 0; i--) {
    var r = Math.floor(Math.random() * (i + 1));
    var tmp = a[i];
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
  if (! n || n < 2) Y.throw(ver, 'Abnormal argument');
  if (b.length > n) b.splice(0, (b.length - n));
  return b;
}
function encode (buf, result) {
  if (! result) { result =
    (c, t, b) => { return { char:c, text:c, invalid:b } };
  }
  const Char = encodeJP().detect(buf); // || 'UTF8';
  if (! Char || Char == 'BINARY')
    { return result(Char, '', true) }
  if ( Char == 'UNICODE' || Char == 'UTF8'
    || Char == 'UTF32'   || Char == 'ASCII' )
    { return result(Char, buf.toString(), false) }
  const Text = encodeJP().convert
    (buf, { to: 'UNICODE', from: Char, type: 'string' });
  return result(Char, Text, false);
}
function tmpl (tmpl, obj) {
  if (! tmpl) Y.throw('Unknown template');
  return tmpl.replace(/<\s*([^<>\r\n\t]+)\s*>/g, (tmp, fr) => {
    let [o, args] = [(obj || {})];
    fr = fr.trim();
    if (fr.match(/([^\(]+)\s*\(\s*([^\)]+)\s*\)/)) {
      [fr, args] = [RegExp.$1.trim(), RegExp.$2];
      args = args.trim().split(/\s*\,\s*/);
    }
    for (let key of fr.split(/\s*\.\s*/)) {
      o = (! o[key] && o[key] != 0) ? tmp : o[key];
      if (typeof o == 'function') return o(args || '');
      if (typeof o != 'object') return o;
    }
    return tmp;
  });
}
function Try (Fmain, Ferr) {
  try {
    return Fmain();
  } catch (error) {
    return Ferr ? Ferr(error) : Y.tr(ver, error);
  }
}
function sleep (n) {
  let start = MOMENT().unix();
  while (true) { if ((MOMENT().unix() - start) > n) break }
}
