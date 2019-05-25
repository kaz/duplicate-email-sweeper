"use strict";

const IMAP = require("imap");

const imap = new IMAP({
	user: "your-username",
	password: "y0ur-passw0rd",
	host: "your.imap.server",
	autotls: "always",
});

const ids = require("./saved-ids.json");

imap.once("ready", () => {
	imap.openBox("INBOX", true, (err, inbox) => {
		const f = imap.seq.fetch(`1:*`, {bodies: ["HEADER.FIELDS (MESSAGE-ID)"]});
		f.on("message", (msg, seqno) => {
			msg.on("body", stream => {
				const buffer = [];
				stream.on("data", chunk => buffer.push(chunk));
				stream.on("end", () => {
					const match = /<(.+)>/.exec(Buffer.concat(buffer));
					if(match && ids.includes(match[0])){
						imap.seq.addFlags(seqno, "\\Flagged");
						console.log("Flagged", seqno);
					}
				});
			});
		});
		f.on("end", () => imap.end());
	});
});

imap.connect();
