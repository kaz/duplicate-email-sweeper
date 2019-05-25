"use strict";

const IMAP = require("imap");

const imap = new IMAP({
	user: "your-username",
	password: "y0ur-passw0rd",
	host: "your.imap.server",
	autotls: "always",
});

const ids = [];

imap.once("ready", () => {
	imap.openBox("INBOX", true, (err, inbox) => {
		const f = imap.seq.fetch(`1:*`, {bodies: ["HEADER.FIELDS (MESSAGE-ID)"]});
		f.on("message", msg => {
			msg.on("body", stream => {
				const buffer = [];
				stream.on("data", chunk => buffer.push(chunk));
				stream.on("end", () => {
					const [match] = /<(.+)>/.exec(Buffer.concat(buffer));
					if(!match){
						console.log("!!! FATAL ERROR !!!");
						process.exit(-1);
					}
					ids.push(match);
				});
			});
		});
		f.on("end", () => {
			imap.end();
			console.log(JSON.stringify(ids, null, "\t"));
		});
	});
});

imap.connect();
