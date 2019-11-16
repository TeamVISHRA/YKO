'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const  my = 'ybBaseSchema.js';
const ver = `yko/${my} v191114`;
//
const T = new (require('../TOOL.js'));
//
const VALIDS = {
  isArray      : (x)=>
  { return { err: (T.isArray(x)  ? false: 'isArray') } },
  isHashArray  : (x)=>
  { return { err: (T.isHashArray(x) ? false: 'isHashArray') } },
  isString     : (x)=>
  { return { err: (T.isString(x) ? false: 'isString') } },
  isStringEasy : (x)=>
  { return { err: (T.isStringEasy(x) ? false: 'isStringEasy') } },
  isNumber     : (x)=>
  { return { err: (T.isNumber(x) ? false: 'isNumber') } },
  isUTC        : (x)=>
  { return { err: (T.isNumber(x) ? false: 'isUTC') } },
   toLowerCase : (x)=> { return { conv: [T.A2a(x)  ] } },
   toUpperCase : (x)=> { return { conv: [T.a2A(x)  ] } },
     toHankaku : (x)=> { return { conv: [T.z2h(x)  ] } },
     canonical : (x)=> { return { conv: [T.canon(x)] } },
  regex : (x, reg, opt) => {
    return {
      err: (x.match(new RegExp(reg, opt)) ? false: 'regex')
  } }
};
function _UTIL_ (B, S, Db) {
  const U = this;
  function VALUE (key) {
    return S.$COLUMNS[key] ? Db : Db.value;
  }
  function $Number (key) {
    const V = VALUE(key);
    if (T.isNumber(V[key])) return V;i
    S.throw(`[${B.ver}] '${key}' is Not integer.`);
  }
  function $Hash (key) {
    const V = VALUE(key);
    if (T.isHashArray(V[key])) return V;
    S.throw(`[${B.ver}] '${key}' is Not isHashArray.`);
  }
  function $Array (key) {
    const V = VALUE(key);
    if (T.isArray(V[key])) return V;
    S.throw(`[${B.ver}] '${key}' is Not array.`);
  }
  U.inc = (key, n) => {
    const val = $Number(key);
    val[key] += (n || 1); return B.update(key);
  };
  U.dec = (key, n) => {
    const val = $Number(key);
    val[key] -= (n || 1); return B.update(key);
  };
  U.setHash = (key, v) => {
    const [k1, k2] = T.isArray(key) ? key: key.split('.');
    if (! k1 || ! k2)
        S.throw(`[${B.ver}] Insufficient arguments.`);
    const val = $Hash(k1)[k1];
    val[k2] = v; return B.update(k1);
  };
  U.rmHash = (...key) => {
    const [k1, k2] = key[1] ? key:
        (T.isArray(key[0]) ? key[0]: key[0].split('.'));
    if (! k1 || ! k2)
        S.throw(`[${B.ver}] Insufficient arguments.`);
    const val = $Hash(k1)[k1];
    if (val[k2]) delete val[k2];
    return B.update(k1);
  };
  U.push = (key, v) => {
    const val = $Array(key)[key];
    val.push(v); return B.update(key);
  };
  U.shift = (key) => {
    const val = $Array(key)[key];
    val.shift(); return B.update(key);
  };
  U.unshift = (key, v) => {
    const val = $Array(key)[key];
    val.unshift(v); return B.update(key);
  };
  U.pop = (key) => {
    const val = $Array(key)[key];
    val.pop(); return B.update(key);
  };
  U.check2Push = (key, v, check) => {
    const val = $Array(key)[key];
    if (val.find(check || (x=> x == v))) return false;
    val.push(v); return B.update(key);
  };
  U.check2unshift = (key, v, check) => {
    const val = $Array(key)[key];
    if (val.find(check || (x=> x == v))) return false;
    val.unshift(v); return B.update(key);
  };
  U.filter = (key, v) => {
    const val = $Array(key);
    val[key] = val[key].filter(x=> x != v);
    return B.update(key);
  };
  U.setDefault = (key) => {
    if (! S.$COLUMNS[key])
        S.throw(`[${B.ver}] Unknown '${key}'.`);
    let func; if (func = S.$DEFAULTS[key])
        { Db[key] = func(); return B.update(key) }
    return false;
  };
  U.keys    = (key) => { return T.k($Hash(key)[key]) };
  U.values  = (key) => { return T.v($Hash(key)[key]) };
  U.entries = (key) => { return T.e($Hash(key)[key]) };
}
const DEFAULTS = {
   'utc()': () => { return T.utc()    },
  'unix()': () => { return T.unix()   },
  'date()': () => { return new Date() }
};
module.exports.Reserv = [
  'timeStamp',
  'timeInsert',
  'timeMdify',
  'timeTrash',
  'timeRecycle'
];
function isReserv (key) {
  return exports.Reserv.find(o=> o == key);
}
const Qo = '[\\\'\\"\\/\\`]';
module.exports.init = function (S) {
  if (! S.columns)
      S.throw(`[${S.ver}] 'S.columns' setup required`);
  S.$DEFAULTS = T.c(null);
  S.$VALIDS   = T.c(null);
  S.$COLUMNS  = T.c(null);
  const uniqueKeys = [];
  let ReservUniqueValue = [];
  for (let key of T.v(S.columns)) {
    const [Name, Init, Valid] = key;
    if (Name == 'value' || isReserv(Name)) {
      S.throw(`[${S.ver}] '${Name}' cannot be used.`);
    }
    S.tr5(`[${S.ver}] Setup column '${Name}'.`);
    if (Valid) {
      const V = S.$VALIDS[Name] = [];
      for (let name of Valid) {
        if (name == 'isKey') {
          uniqueKeys.push(Name);
          if (Init) {
            ReservUniqueValue.push
              (DEFAULTS[Init] ? DEFAULTS[Init](): Init);
          }
        } else {
          if (/^\s*([^\(\s]+)\s*\(\s*(.+)\s*\)\s*$/.exec(name)) {
            let arg; [name, arg] = [RegExp.$1, RegExp.$2];
            arg = arg.trim()
                .replace(new RegExp(`^${Qo}`), '')
                .replace(new RegExp(`${Qo}$`), '')
                .split(new RegExp(`${Qo}\\s*\\,\\s*${Qo}`));
            V.push(x=> { return VALIDS[name](x, ...arg) });
          } else {
            V.push(VALIDS[name]);
          }
          S.$COLUMNS[Name] = [0];
        }
      }
    } else {i
      S.$COLUMNS[Name] = [0];
    }
    S.$DEFAULTS[Name] = Init
        ? (DEFAULTS[Init] || (() => { return Init }))
        : (() => { return Init });
  }
  const Len = uniqueKeys.length;
  if (Len < 1)
      S.throw(`[${S.ver}] There is no key setting.`);
  S.$KeyCheck = (Keys) => {
    if (! Keys) {
      Keys = S.ARGS || (()=> {
        return ReservUniqueValue.length > 0
                  ? ReservUniqueValue: false;
      }) () || S.throw(`[${S.ver}] Key is unknown.`);
    }
    S.UNIQUE = T.c(null);
    const tmpKeys = T.isArray(Keys)
                  ? Keys: T.canon(Keys).split('.');
    S.tr3(`[${S.ver}] keyCheck:`, tmpKeys, Len);  
    if (tmpKeys.length != Len)
      S.throw(`[${S.ver}] Number of keys does not match.`,
              `${tmpKeys.length} != ${Len}`);
    for (let key of uniqueKeys) {
      S.UNIQUE[key] = tmpKeys.shift()
          || S.throw(`[${S.ver}] 'key' is undefined.`);
    }
    return S.UNIQUE;
  };
};
module.exports.setupTrashStyle = function (B, S, Db) {
  return _SETUP_
    ((Db && ! exports.trash(B, S, Db)), B, S, Db);
};
module.exports.setup = function (B, S, Db) {
  return _SETUP_(Db, B, S, Db);
};
function _SETUP_ (judge, B, S, Db) {
    B.root = S.root;
  B.parent = S;
  if (judge) {
    S.tr3(`[${B.ver}] !! Aleady !!`, Db._id);
    B.lawData = Db;
        B.$ID = { _id: Db._id };
        B._id = () => { return Db._id };
     B.hasNew = () => { return false  };
  } else {
    B.lawData = Db = { value: S.tool.c(null) };7
        B._id = () => { return false };
     B.hasNew = () => { return true  };
  }
  return B;
}
module.exports.component = function (B, S) {
  let UPDATE, Db = B.lawData;
  B.Reserv = T.clone(exports.Reserv);
  B.isReserv = isReserv;
  B.$HOOKS = { INSERT:() => {}, UPDATE:() => {} };
  function VALID (key, value) {
    const Vs = S.$VALIDS[key] || [];
    for (let v of Vs) {
      let res = v(value);
      if (res.err) { S.throw
        (`[${B.ver}] ValidError: ${res.err} in '${key}'.`);
      } else if (res.conv) {
        value = res.conv[0];
      }
    }
    return value;
  };
  let COLS; if (COLS = S.$COLUMNS) {
    if (B.hasNew()) {
      for (let [key, func] of T.e(S.$DEFAULTS)) {
        Db[key] = func();
      };
      Db.timeInsert = Db.timeMdify = T.utc();
      Db.timeStamp = new Date();
    }
    B.has = (key) => {
      return ((key in COLS) || (key in Db.value));
    }
    B.get = (key) => {
      return COLS[key] ? Db[key]: Db.value[key];
    };
    B.set = (key, val) => {
      if (COLS[key]) {
        COLS[key] = [1];
        Db[key] = VALID(key, val);
      } else {
        Db.value[key] = val;
      }
      UPDATE = 1;
      return B
    };
    B.delete = (key) => {
      if (key in Db.value) {
        delete Db.value[key];
        UPDATE = 1;
      } else if (key in COLS) {
        S.throw
        (`[${B.ver}] Cannot delete data in predefined columns.`);
      }
      return B
    };
  } else {
    S.$DEFAULTS = T.c(null);
    S.$VALIDS   = T.c(null);
    S.$COLUMNS  = T.c(null);
    B.has = (key)  => { return (key in Db.value) };
    B.get = (key)  => { return Db.value[key] };
    B.set = (k, v) => { Db.value[k] = v; UPDATE = 1; return B };
    B.delete = (key) => {
      if (B.has(key)) { delete Db.value[key]; UPDATE = 1 }
      return B;
    };
  }
  for (let method of exports.Reserv) {
    B[method] = () => { return Db[method] };
  }
  B.regist = S.par.regist;
  B.update = (key) => {
    UPDATE = 1;
    if (key) {
      for (let k of (T.isArray(key) ? key: [key])) {
        if (S.$COLUMNS[k]) S.$COLUMNS[k] = [1];
      }
    }
    return B;
  };
     B.keys = ()  => { return T.k(Db.value) };
      B.ref = ()  => { return Db.value };
B.Reference = ()  => { return Db };
   B.export = ()  => { return T.clone(Db.value) };
   B.import = (o) => {
    if(! T.isHashArray(o))
        S.throw(`[${B.ver}] Type is different.`);
    UPDATE = true;
    Db.value = o;
    return B;
  };
  let UTIL;
  B.util = () => {
    return UTIL || (UTIL = new _UTIL_ (B, S, Db));
  };
  B.prepar = () => {
    S.tr3(`[${B.ver}] preper`);
    if (! UPDATE) return B;
    S.tr3(`[${B.ver}] preper`, 'Update is active.');
    let save;
    if (B.hasNew()) {
      S.tr3(`[${B.ver}] preper !! insert !!`);
      save = { ...S.UNIQUE, value: Db.value };
      for (let key of ['timeStamp', 'timeMdify', 'timeInsert'])
        { save[key] = Db[key] }
      for (let [key, v] of T.e(S.$COLUMNS))
        { save[key] = VALID(key, Db[key]) }
      B.$HOOKS.INSERT(save);
      B.regist(x=> { return S.cls.insertOne(save) });
    } else {
      S.tr3(`[${B.ver}] preper`, `target: ${B._id()}`);
      save = { value: Db.value };
      save.timeMdify = T.utc();
      for (let [key, v] of T.e(S.$COLUMNS))
        { if (v[0]) save[key] = VALID(key, Db[key]) }
      B.$HOOKS.UPDATE(save);
      B.regist(x=> { return S.cls.updateOne(B.$ID, save) });
    }
    S.tr7(`[${B.ver}] preper`, save);
    return B;
  };
  B.commit = () => { return S.par.commit() };
  B.DataRemove = () => {
    S.tr3(`[${B.ver}] DataRemove`);
    if (! B.$ID) S.throw(I, 'This data does not exist.');
      // Equivalent to preper
    B.regist(x=> {
      return S.cls
        .updateOne(B.$ID, { timeTrash: T.unix() });
    });
    B.DataRemove = B.update = B.prepar = false;
    return B;
  };
}
module.exports.trash = function (B, S, Db) {
  if (! Db.timeTrash) return false;
  B.hasTrash = true;
  B.lawTrash = () => { return Db };
  B.Recycle  = () => {
    S.tr3(`[${B.ver}] Recycle`);
    return (new Promise (async (resolve, reject) => {
      let BOX;
      await S.cls.findOne(S.UNIQUE).then(db=> BOX = db );
      if (BOX) reject('Cannot be unique.');
      const save = {
          timeTrash: false,
        timeRecycle: new Date()
      };
      B.regist(x=> { return S.cls.updateOne(B.$ID, save) });
      B.remove = B.update = B.prepar = false;
      return resolve(B);
    }))
    .catch(e=> S.tr(`[${B.ver}] !! Recycle:Warning !!`, e));
  };
  return true;
}
