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

function cli(args:string[]): Promise<void> {
    args.forEach((arg:string, i:number) => {
        switch (args[i]) {
            case '-c': settings.root = args[i+1]; break;
            case '-r': switch(args[i+1]) { 
                case 'info':    log.level(log.INFO, true); break;
                case 'debug':   log.level(log.DEBUG, true); break;
                case 'warning': log.level(log.WARN, true); break;
                default: log.level(log.INFO, true); break;
            } break;    
            case '-h': 
            default:    log.info(helpText);         
        }
    });
    return Promise.resolve();
}

cli(process.argv);
ftp.start('', settings);
