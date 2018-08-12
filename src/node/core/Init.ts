import { Log }              from 'hsnode';  const log = new Log('Init');
import { Foscam }           from '../device/Foscam';
import { WansView }         from '../device/WansView';
import * as Comm            from './CommandReceiver';
import * as Exec            from './CommandExecution';
import { Settings }         from './Settings';
import { users }            from '../comm/UserComm';
import { DeviceSettings, 
         DeviceList,
         Device }           from '../device/Device';


function addCommands() {
    Comm.addCommand(Exec.helpFn,        'help');
    Comm.addCommand(Exec.facetimeFn,    'facetime');
    Comm.addCommand(Exec.armFn,         'arm',      '[away]');
    Comm.addCommand(Exec.disarmFn,      'disarm');
    Comm.addCommand(Exec.disarmFn,      'relax');
    Comm.addCommand(Exec.armingStatusFn,'status');
    Comm.addCommand(Exec.snapFn,        'snap');
    Comm.addCommand(Exec.lightFn,       'light',    'on|off');
    Comm.addCommand(Exec.restartFn,     'restart');
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
    log.logFile(`${settings.homeSecDir}${settings.logDir}${settings.logFile}`);
    settings.users.map(user => users.addUser(user));
    users.setDefaultRecipient(settings.activeRecipient);
    createDevices(settings);
    addCommands();
    new Comm.EmailPolling(5000);
    log.info('security system started');
    return settings;
};

export const startSecuritySystemTestMode = (settings:Settings):Settings => {
    log.logFile(`${settings.homeSecDir}/${settings.logDir}/${settings.logFile}`);
    return settings;
};

export const initDevices = (settings:Settings) => {
    Exec.setSnapshotDir(`${settings.homeSecDir}/${settings.recDir}/`);
    DeviceList.getDevices().map((dev:Device) => dev.initDevice(settings));
    log.info(`devices initialized: ${DeviceList.getDevices().map(d=>d.getName()).join(', ')}`);
};


