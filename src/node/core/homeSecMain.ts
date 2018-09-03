/**
 * Home Alarm Manager - Main entry point
 * Call as:
 * ```
 * node run 
 * ```
 */

/** */

import { log as gLog }  from 'hsnode';  const log = gLog('hsMain');
import { fs }           from 'hsnode';
import * as init        from './Init';
import { CfgSettings }  from './CfgSettings';
import * as ftp         from '../comm/ftpSrv';
import * as httpSrv     from '../comm/httpSrv';
import { setAlarmText}  from './alarm';

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

function ftpInit(settings: CfgSettings):CfgSettings {
    if (cliParams.ftpServer) { ftp.start(settings.homeSecDir, settings.ftp); }
    return settings;
}

function httpInit(settings: CfgSettings):CfgSettings {
    httpSrv.start(); 
    return settings;
}

async function start() {
    log.debug('Starting Home Security System');
    log.level(log.INFO);
    await cli(process.argv);
    const cfg = await fs.readJsonFile(__dirname+'/../../config/homeCfg.json');
    await ftpInit(cfg);
    await httpInit(cfg);
    await init.startSecuritySystem(cfg);
    await init.initDevices(cfg);
    await setAlarmText(cfg);
    await init.startScheduledTasks(cfg);
}

try {
    start().catch(log.error);
    process.on('exit', (code:string) => {
        log.info(`About to exit with code: ${code}`);
        httpSrv.stop();
    });
}
catch(err) { log.error(err); }


