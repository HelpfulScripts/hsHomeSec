#!/bin/node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hsnode_1 = require("hsnode");
const log = new hsnode_1.Log("MailResponse");
const hsnode_2 = require("hsnode");
const hsnode_3 = require("hsnode");
const httpSrv_1 = require("../node/comm/httpSrv");
const init = require("../node/core/Init");
function processCommand(args) {
    log.info(`processCommand: ${args[2]}`);
    const mail = args[2].split(',').map(a => a.trim());
    const match = mail[1].match(/<(.*)>/);
    const sender = match[1];
    const subject = mail[0].toLowerCase();
    log.info(`sender:${sender}, subject:${subject}`);
    hsnode_3.http.get(`http://127.0.0.1:${httpSrv_1.commandPort}/?cmd=${subject}&sender=${sender}`);
}
try {
    log.logFile(__dirname + '/../MR%YYYY%MM%DD-%hh.log')
        .then((l) => log.info(`new log: ${l}`))
        .then(() => {
        log.info('Starting Home Security System');
        hsnode_2.fs.readJsonFile(__dirname + '/../config/homeCfg.json')
            .then(init.startSecuritySystem)
            .then(() => processCommand(process.argv))
            .catch(log.error.bind(log));
    });
}
catch (err) {
    log.error(err);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbFJlc3BvbnNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NoZWxsc2NyaXB0L21haWxSZXNwb25zZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxtQ0FBc0M7QUFBQyxNQUFNLEdBQUcsR0FBRyxJQUFJLFlBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUMzRSxtQ0FBc0M7QUFDdEMsbUNBQXNDO0FBQ3RDLGtEQUFvRDtBQUNwRCwwQ0FBaUQ7QUFLakQsd0JBQXdCLElBQWE7SUFDakMsR0FBRyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN2QyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ25ELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDdEMsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3hCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN0QyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsTUFBTSxhQUFhLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDakQsYUFBSSxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IscUJBQVcsU0FBUyxPQUFPLFdBQVcsTUFBTSxFQUFFLENBQUMsQ0FBQztBQUNqRixDQUFDO0FBRUQsSUFBSTtJQUNBLEdBQUcsQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFDLDJCQUEyQixDQUFDO1NBQ2pELElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDdEMsSUFBSSxDQUFDLEdBQUcsRUFBRTtRQUVQLEdBQUcsQ0FBQyxJQUFJLENBQUMsK0JBQStCLENBQUMsQ0FBQztRQUMxQyxXQUFNLENBQUMsWUFBWSxDQUFDLFNBQVMsR0FBQyx5QkFBeUIsQ0FBQzthQUN2RCxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDO2FBQzlCLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3hDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2hDLENBQUMsQ0FBQyxDQUFDO0NBQ047QUFDRCxPQUFNLEdBQUcsRUFBRTtJQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FBRSJ9