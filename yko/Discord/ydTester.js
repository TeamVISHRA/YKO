//
// yko/Discord/ydTester.js
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const ver = 'yko/Discord/ydTester.js v190917.01';
//
module.exports = function (Y, P, mlib) {
  this.ver = ver;
	const S = this;
  if (mlib == 'Discord') build_function(Y, P, S);
};
function build_function (Y, P, S) {
	const Df = P.bot = new DiscordFakeClient(Y, P, S);
	Df.login = (token) => {
		Y.c(`Discord Fake ... token(${token})`);
	};
  S.login = (func) => {
    P.bot = new Y.Discord.J.Client();
    P.bot.on('ready', n => { func() });
    P.bot.login(Y.im.discord.token);
  };
	S.DMmessage = (wait, args, Handler) => {
    Df.guild.id = Df.channel.id = false;
		S.message(wait, args, (Handler || Df));
	};
	S.message = (wait, args, Handler) => {
		if (! wait) wait = 0;
		if (! Handler) Handler = P.bot;
		Df.FakeRun();
		const func = P.bot.trigger('message');
		if (! func) Y.throw(ver, "No prepar of 'message'");
		let [count, timer] = [0];
		const len = args.length;
		const RUN = () => {
			let str = Handler.content = args[count];
			Y.c(`\nMessage received: ${str}`);
			func(Handler);
			if (len > 1 && ++count >= len) {
				clearInterval(timer);
			}
		};
		if (len > 1) {
			RUN();
			timer = setInterval(RUN, wait);
		} else {
			RUN();
		}
	};
	S.App = (load, str) => {
    S.login( async () => {
      let M = P.Message();
      Y.c(' Debug start ======================================');
      await P.refreshGUILDS().then(o=> {
	       M.start( fakeHandler(Y, P, S) );
         M.App(load).run(str);
      });
      Y.c('============================< Debug complete >=====');
    });
	};
  S.Exec = (func) => {
    S.login( async () => {
      Y.c(' Debug start ======================================');
      await P.refreshGUILDS().then(o=> {
        func( fakeHandler(Y, P, S) );
      });
      Y.c('============================< Debug complete >=====');
    });
  };
  S.CronJob = async (load) => {
    S.login( async () => {
      Y.c(' Debug start ======================================');
Y.c(Y.CRON);
      await Y.CRON.Job(load).run();
      Y.c('============================< Debug complete >=====');
    });
  };
}
function DiscordFakeClient (Y, P, S) {
	const Df = this;
	const build_engine = P._export_build_engine_();
	const POOL = {};
	Df.on = (key, func) => { POOL[key] = func };
	Df.trigger = (k) => { return POOL[k] };
	build_engine(Y, P);
	Df.FakeRun = Y.run;
	Y.run = P.run = () => {};
  const FAKE = fakeHandler(Y, P, S);
  for (let [k, v] of Object.entries(FAKE)) { Df[k] = v }
}
function fakeHandler (Y, P, S) {
  const im = Y.im.discord.devel;
	const FAKE = {
		content: '',
		author: {
			id: im.userID,
			username: 'FAKE-USER',
			discriminator: '12345',
			avatarURL: 'http://fake.com/fake.jpg',
			send: fakeSend(Y)
		},
		guild: {
			id: im.guild,
			name: 'FAKE-GUILD',
			ownerID: im.userID,
			memberCount: 10,
			iconURL: 'http://fake.com/fake.jpg'
		},
		member: {
			nickname: 'YKO-FAKE'
		},
		channel: {
			id: im.channel,
			name: 'DEVEL-FAKE-ROOM',
      send: fakeSend(Y)
		},
		reply: fakeSend(Y),
		delete: () => {}
	};
  FAKE.user = FAKE.author
  FAKE.users = { get: (id) => { return FAKE.user } };
  FAKE.guilds = { get: (id) => { return FAKE.guild } };
  FAKE.channels = { get: (id) => { return FAKE.channel } };
  FAKE.guild.channels = FAKE.channels;
  FAKE.guild.user = FAKE.author;
  FAKE.guild.members = { get: (id) => { return FAKE.author } };
  return FAKE;
}
function fakeSend (Y) {
	return (str) => {
		return new Promise ( resolve => {
			Y.c('--- < FAKE-OBJ >.SEND  -----');
			Y.c(str);
			Y.c(`--- ${ver} ---`);
			return resolve({ delete: () => {
				Y.c('.. <callback-delete-message>');
			} });
		});
	};
}
