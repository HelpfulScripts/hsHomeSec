import { Log }              from 'hsnode';  const log = new Log('hsInit');
import { Foscam }           from '../device/hsFoscam';
import { WansView }         from '../device/hsWansView';
import * as Comm            from './hsCommandReceiver';
import * as Exec            from './hsCommandExecution';
import { Settings }         from './hsSettings';
import { users }            from '../comm/hsUserComm';
import { DeviceSettings, 
         DeviceList,
         Device }           from '../device/hsDevice';

// export function setRestartTimer(hour:number, minute:number, recipient:Recipient) {
//     const now = new Date();
// //    const restartTime = new Date(now.getTime()+10*60*1000); // in 10 min

//     const restartTime = new Date(now.getTime()+10*60*1000);
//     restartTime.setHours(hour,minute,0,0);
//     if (restartTime < now) { restartTime.setDate(restartTime.getDate()+1); }
    
//     const diff = restartTime.getTime() - now.getTime();
//     Promise.resolve().then(delay(diff)).then(Exec.restartFn);
//     return OSA.iMessage('next restart in ' + Math.round(10*diff/1000/60/60)/10 + ' hours', [recipient]);
// }

function addCommands() {
    Comm.addCommand('help',      Exec.helpFn);
    Comm.addCommand('facetime',  Exec.facetimeFn);
    Comm.addCommand('arm',       Exec.armFn,     'arm [away]');
    Comm.addCommand('disarm',    Exec.disarmFn);
    Comm.addCommand('relax',     Exec.disarmFn);
    Comm.addCommand('status',    Exec.armingStatusFn);
    Comm.addCommand('snap',      Exec.snapFn);
    Comm.addCommand('light',     Exec.lightFn,   'light on|off');
    Comm.addCommand('restart',   Exec.restartFn);
//    Comm.addCommand('test',      Exec.test);
    log.debug(`added ${Comm.getCommands().length} commands`);
}

function createDevices(settings:Settings) {
    settings.devices.map((dev:DeviceSettings) => {
        if (dev.type === 'foscam')   { new Foscam(dev, settings); }
        if (dev.type === 'wansview') { new WansView(dev, settings); }
        log.debug(`created device '${dev.name}'`);
    });
}

//==========================================================
// Security System Setup
//==========================================================
export const startSecuritySystem = (settings:Settings):Settings => {
//    log.logFile(`${__dirname}/../../${settings.logFile}`);
    settings.users.map(user => users.addUser(user));
    createDevices(settings);
    addCommands();
    log.info('security system started');
    return settings;
};

export const startSecuritySystemTestMode = (settings:Settings):Settings => {
    log.logFile(`${__dirname}/../../test${settings.logFile}`);
    log.level(log.INFO);
    return settings;
};

export const initDevices = (settings:Settings) => {
    Exec.setSnapshotDir(settings.homeSecDir+settings.recDir+'snapshots/') ;
    DeviceList.getDevices().map((dev:Device) => dev.initDevice(settings));
    log.info(`devices initialized: ${DeviceList.getDevices().map(d=>d.getName()).join(', ')}`);
};


