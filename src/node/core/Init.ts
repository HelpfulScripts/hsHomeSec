import * as node        from 'hsnode';  const log = node.log('Init');
import { Foscam }       from '../device/Foscam';
import { WansView }     from '../device/WansView';
import * as Comm        from './CommandReceiver';
import * as Exec        from './CommandExecution';
import { CfgSettings }  from './CfgSettings';
import { users }        from '../comm/UserComm';
import { DeviceSettings, 
         DeviceList,
         Device }       from '../device/Device';


function addCommands() {
    Comm.addCommand(Exec.helpFn,        'help');
    Comm.addCommand(Exec.facetimeFn,    'facetime');
    Comm.addCommand(Exec.armFn,         'arm',      '[away]');
    Comm.addCommand(Exec.disarmFn,      'disarm');
    Comm.addCommand(Exec.disarmFn,      'relax');
    Comm.addCommand(Exec.armingStatusFn,'status');
    Comm.addCommand(Exec.snapFn,        'snap',     '[%name%]');
    Comm.addCommand(Exec.lightFn,       'light',    'on|off');
    Comm.addCommand(Exec.restartFn,     'restart');
    Comm.addCommand(Exec.camPreset,     'preset',   '%name%',   '%index%');
    log.debug(`added ${Comm.getCommands().length} commands`);
}

function createDevices(settings:CfgSettings) {
    settings.devices.map((dev:DeviceSettings) => {
        if (dev.type === 'foscam')   { new Foscam(dev, settings); }
        if (dev.type === 'wansview') { new WansView(dev, settings); }
        log.debug(`created device '${dev.name}'`);
    });
}


function wifiCheck(settings:CfgSettings) {
    const ssid = settings.wifiNetwork;
    const pwd  = settings.wifiPasswd;
    return async () => {
        const result = await node.exec('networksetup -getairportnetwork en0');
        log.debug(`wifi stdout:'${result.stdout}'`);
        log.debug(`wifi stderr:'${result.stderr}'`);
        if (result.stdout.match(ssid)) {
            log.info(`wifi network connected to ${ssid}`);
        } else {
            log.warn(`wifi not connected to ${ssid}; attempting reconnect`);
            log.warn(`wifi stdout:'${result.stdout}'`);
            log.warn(`wifi stderr:'${result.stderr}'`);
            const nwResult = await node.exec(`networksetup -setairportnetwork en0 ${ssid} ${pwd}`);
            log.warn(`reconnect stdout:'${nwResult.stdout}'`);
            log.warn(`reconnect stderr:'${nwResult.stderr}'`);
        }
    };
}

function setDevicesTime() {
    DeviceList.getDevices().map((dev:Device) => dev.setTime());
}

//==========================================================
// Security System Setup
//==========================================================
export const startSecuritySystem = (settings:CfgSettings):CfgSettings => {
    log.logFile(`${settings.homeSecDir}${settings.logDir}${settings.logFile}`);
    settings.users.map(user => users.addUser(user));
    users.setDefaultRecipient(settings.activeRecipient);
    createDevices(settings);
    addCommands();
    new Comm.EmailPolling(5000);
    log.info('security system started');
    return settings;
};

export const startSecuritySystemTestMode = (settings:CfgSettings):CfgSettings => {
    log.logFile(`${settings.homeSecDir}/${settings.logDir}/${settings.logFile}`);
    return settings;
};

export const initDevices = (settings:CfgSettings):CfgSettings => {
    Exec.setSnapshotDir(`${settings.homeSecDir}/${settings.recDir}/`);
    DeviceList.getDevices().map((dev:Device) => dev.initDevice(settings));
    log.info(`devices initialized: ${DeviceList.getDevices().map(d=>d.getName()).join(', ')}`);
    return settings;
};

export function startScheduledTasks(settings:CfgSettings) {
    const WifiCheckHours = 1;
    const SetTimeHours = 12;
    if (settings.wifiNetwork && settings.wifiPasswd) {
        setInterval(wifiCheck(settings), WifiCheckHours*60*60*1000);
    }
    setInterval(setDevicesTime, SetTimeHours*60*60*1000);
    log.info('scheduled tasks started.');
}