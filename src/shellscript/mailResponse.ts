#!/bin/node

import { Log }          from 'hsnode'; const log = new Log("MailResponse");
import { fs as fsUtil } from 'hsnode';
import { http }         from 'hsnode';
import { commandPort }  from '../node/comm/httpSrv';
import * as init        from '../node/core/Init';

// const fs = require('fs');
// fs.writeFileSync(__dirname+'/test.txt', 'yo');

function processCommand(args:string[]) {
    log.info(`processCommand: ${args[2]}`);
    const mail = args[2].split(',').map(a => a.trim());
    const match = mail[1].match(/<(.*)>/);
    const sender = match[1];
    const subject = mail[0].toLowerCase();
    log.info(`sender:${sender}, subject:${subject}`);
    http.get(`http://127.0.0.1:${commandPort}/?cmd=${subject}&sender=${sender}`);    
}

try {
    log.logFile(__dirname+'/../MR%YYYY%MM%DD-%hh.log')
    .then((l) => log.info(`new log: ${l}`))
    .then(() => {
        // log.logFile(__dirname+'/MR.log');
        log.info('Starting Home Security System');
        fsUtil.readJsonFile(__dirname+'/../config/homeCfg.json')
        .then(init.startSecuritySystem)
        .then(() => processCommand(process.argv))
        .catch(log.error.bind(log));
    });
}
catch(err) { log.error(err); }


