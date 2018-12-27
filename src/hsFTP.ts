#!/usr/bin/env node

import { log as gLog }  from 'hsnode';  const log = gLog('hsFTP');
import * as ftp         from './node/comm/ftpSrv';

const settings:ftp.FtpSettings = ftp.getSettings();

const helpText = `
Starts an ftp server with following options:
-c root directory, defaults to './'
-r reporting level, 'debug'|info'|'warning', defaults to 'info'
-h this help text
`;

settings.host = '127.0.0.1';

function cli(args:string[]): boolean {
    let i = 2;
    while (i<args.length) {
        switch (args[i++]) {
            case '-c':  let path = args[i++]; 
                        if (path.indexOf('/')===0) { 
                            settings.root = path; 
                        } else {
                            settings.root = `${__dirname}/${path}`; 
                        }
                        break;
            case '-r': switch(args[i++]) { 
                case 'info':    log.level(log.INFO, true); break;
                case 'debug':   log.level(log.DEBUG, true); break;
                case 'warning': log.level(log.WARN, true); break;
                default: log.level(log.INFO, true); break;
            } break;    
            case '-h': log.info(helpText);  return false;       
        }
    }
    return true;
}

if (cli(process.argv)) {
    log.info(`${log.inspect(settings)}`);
    ftp.start('', settings);
}
