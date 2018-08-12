/**
 * Home Alarm Manager - Main entry point
 * Call as:
 * ```
 * node run 
 * ```
 */

/** */

import { Log }      from 'hsnode';   const log = new Log('hsMain');
import { fs }       from 'hsnode';
import * as init    from './Init';
import { Settings } from './Settings';
import * as ftp     from '../comm/ftpSrv';
import * as httpSrv from '../comm/httpSrv';

const cliParams = {
    ftpServer: false
};
// log.level(log.DEBUG);

//==========================================================
// Settings
//==========================================================

function cli(args:string[]): Promise<void> {
    args.forEach((arg:string) => {
        const cmd = arg.split('=');
        if (cmd[0] === 'debug')    { log.level(log.DEBUG, true); }
        if (cmd[0] === 'info')     { log.level(log.INFO, true); }
        if (cmd[0] === 'warning')  { log.level(log.WARN, true); }
        if (cmd[0] === 'ftp')      { cliParams.ftpServer = true; }
    });
    return Promise.resolve();
}

function ftpInit(settings: Settings):Settings {
    if (cliParams.ftpServer) { ftp.start(settings.homeSecDir, settings.ftp); }
    return settings;
}

function httpInit(settings: Settings):Settings {
    httpSrv.start(); 
    return settings;
}

try {
    log.debug('Starting Home Security System');
    log.level(log.INFO);
    cli(process.argv)
    .then(() => fs.readJsonFile(__dirname+'/../../config/homeCfg.json'))
    .then(ftpInit)
    .then(httpInit)
    .then(init.startSecuritySystem)
    .then(init.initDevices)
    .catch(log.error.bind(log)); 

    process.on('exit', (code:string) => {
        log.info(`About to exit with code: ${code}`);
        httpSrv.stop();
    });
}
catch(err) { log.error(err); }


