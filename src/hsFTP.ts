#!/usr/bin/env node

import * as node  from 'hsnode';  const log = new node.Log('hsFTP');
import * as ftp         from './node/comm/ftpSrv';

// // see https://nodejs.org/api/esm.html#esm_no_require_exports_module_exports_filename_dirname
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

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
                            settings.root = `./${path}`; 
                        }
                        break;
            case '-r': switch(args[i++]) { 
                case 'info':    log.level(node.Log.INFO, true); break;
                case 'debug':   log.level(node.Log.DEBUG, true); break;
                case 'warning': log.level(node.Log.WARN, true); break;
                default: log.level(node.Log.INFO, true); break;
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
