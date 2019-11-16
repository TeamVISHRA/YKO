'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ydaTicket.js';
const ver = `${my} v191115`;
//
module.exports.Unit = function (P) {
  const R = P.root,
        T = P.tool;
  const U = R.unitKit('ticket', this, P);
    U.ver = ver;
    U.run = run;
  function run (crum) {
    const i = T.A2a(crum);
    if (/^log$/i.test(i)) {
    } else if (/^guilds/) {
      GUILDS().then(x=> P.finish());
    } else if (/^regist\s*(.*)$/) {
      REGIST(RegExp.$1).then(x=> P.finish());
    } else {
      HELP().then(x=> R.finish());
    }
  }
  async function HELP () {
    P.delete();
    P.send({ embed: {
      title: 'チケット機能のヘルプ',
      color: 0x0083FC, fields: [
      { name: `${PF()}ticket log`,
        value: '`・log 閲覧用のＵＲＬを発行します。`' },
      { name: `${PF()}ticket regist [GUILD ID] [passward]`,
        value: '`・本機能を利用する為の登録を行います。`\n'
             + '`※利用できるのは、SYSOP 以上の権限の方のみです。`\n'
             + '`※このコマンドはＤＭでしか使用できません。' },
      { name: `${PF()}ticket guilds`,
        value: '`・ボットが接続中の GUILD (鯖) 一覧を表示します。`\n'
             + '`※ GUILD ID が不明な時に使用します。`' },
    ] } }, 60 );
  }
  async function GUILDS (arg) {
    P.delete();
    let fields = [];
    await R.Discord.Client().get_guilds().then(list=> {
      list.forEach(v=> {
        fields.push({
         name: `> ID: ${v.id}`,
        value: `\`${v.name}(参加：${v.memberCount}人\`)`
        });
      });
    });
    return P.send({ embed: {
      title: `【YKOが接続中の GUILD 一覧】`,
      color: 0xd6ce06,
     fields: fields
    } }, 60 );
  }
  async function REGIST (arg) {
    P.delete();
    if (! P.isDM()) return errReply('dontDM');
    if (! arg) return errReply('unknownArg');
    const [_, gid, psw] = /^\s*([^\s]+)\s+([^\s]+)/.exec(arg);
    let is = T.validPSW(pwd);
    if (is.bad) return errReply(is.bad);
    await R.Discord.Client()
           .get_guild(gid || 'n/a').then(x=> is = x);
    if (! is) return errReply('unknownGid');
    let Member; await P.memberNow().then(x=> Member = x);
    if (! Member.hasExpert()) return errReply('unauth');
    Member.set('passwd', T.digest(pwd));
    return P.send(`**登録を完了しました。**
\`※${PF()}ticket log 等で専用のＵＲＬを発行します。
※ＵＲＬ発行の際、次回からこのコマンドは不要です。
※パスワードを変更する時だけ使用して下さい。\``);
  }
  function errReply (key) {
    const msg = ({
      dontDM: `ダイレクト・メッセージでのみ受け付けるコマンドです。`,
unknownGuild: `コマンドに引数（GUILD ID, Password）を付けて下さい。`,
  unknownGid: `GUILD ID が間違っているようです。`,
   notString: `パスワードが未指定です。`,
   minLength: `パスワードの文字数を増やして下さい。`,
   maxLength: `パスワードの文字数が許容を越えています。`,
 illegalChar: `パスワードには半角文字のみ使用して下さい。`,
        poor: `パスワードに使用している文字種が乏しいようです。`,
     badword: `パスワードにバッドワードが含まれています。`,
      unauth: `実行権限がありません。`
    })[key];
    return P.reply(msg, 7);
  }
  function PF () { return R.brain.prefix() }
}
