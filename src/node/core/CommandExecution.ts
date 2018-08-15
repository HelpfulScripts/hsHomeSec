/**
 * @ngdoc object
 * @name hsAlarmServer.hsCommandExecution
 * @description Defines the action for external commands received
 */

import { Log, fs}         from 'hsnode';   const log = Log('hsCmdExec');
import { timeout, delay }        from 'hsutil';
import { osaCommands }    from 'hsosaes6';
import { users }          from '../comm/UserComm';
import { DeviceList }     from '../device/Device';
import { Device, Camera } from '../device/Device';
import { AlarmDevice }    from '../device/Device';
import { getCommands  }   from './CommandReceiver';
import { date }           from 'hsutil';
import * as path          from 'path';

// const IFTTT_On        = '#tbon';
// const IFTTT_Off       = '#tboff';
// const IFTTT_Address   = 'trigger@recipe.ifttt.com';

let gSnapshotDir:string = '';

//==========================================================
// Private functions
//==========================================================

function armingCall(deviceCalls: Promise<boolean>[]):Promise<void> {
    log.info(`waiting for ${deviceCalls.length} responses`);
    return Promise.race([
        Promise.all(deviceCalls),   // call all alarm devices 
        timeout(20000)              // and timeout after 20s
        ])
    .then(() => { log.info(`...completed`); })
    .catch(err => {
        log.error(err);
        const resp = 'some device status results missing';
        log.error(resp);
    });
}

       
//==========================================================
// Exported functions
//==========================================================

export function setSnapshotDir(dir:string) { gSnapshotDir = dir; }

export const helpFn = ():Promise<{message:string}> => { 
    const commands = getCommands();
    let msg = 'available commands:\n ' + commands.join('\n  ');
    return Promise.resolve({message: msg});
};

export const restartFn = ():Promise<{message:boolean}> => {
    return osaCommands.restart()
    .then(result => {
        log.info('restarting...'+result); 
        if (!result || result === true) { 
            process.exit(0); 
            return {message: true};
        } else {
            return {message: false};
        }
    });
};

/**
 * request to snap a picture. If a device name is specified, a snapshot from that device will be requested.
 * If no name is specified, a snapshot from each available camera will be requested.
 * @param params : `[<deviceName>]`
 * @return promise to provide the file name if successful
 */
export const snapFn = (params:string[]):Promise<{attachments:string[]}> => {
    const getSnap = (dev:Camera): Promise<string> =>
        !dev.hasVideo()? Promise.resolve(undefined) :
            dev.snapPicture()
            .then(picData => {
                let fileName = path.normalize(gSnapshotDir + date(`${dev.getName()}_%YYYY%MM%DD-%hh-%mm-%ss.jpg`));
                log.info(`saving snapshot from ${dev.getName()} at ${fileName}`);
                return fs.writeStream(fileName, picData.data);
            });

    return Promise.all((!params || params[0] === '')?
         DeviceList.getDevices().map(getSnap)               // get snapshot from all devices
      : [getSnap(<Camera>DeviceList.getDevice(params[0]))])  // get snapshot from specific device
         .then((files) => { return {attachments:files}; }); // send result(s) back to user
};

/**
 * instrruct a PTZ device to move to a preset, then returns a snapshot
 * @param params : `<deviceName>, <positionIndex>`
 * @return promise to provide the snapshot file name if successful
 */
export const camPreset = (params:string[]):Promise<{attachments:string[]}> => {
    const device = <Camera>DeviceList.getDevice(params[0]);
    const presetIndex = parseInt(params[1]);
    return device.ptzPreset(presetIndex)
    .then(() => log.info(`moving ${device.getName()} to preset ${presetIndex}`))
    .then(delay(10000))     // wait 10s for camera to move
    .then(() => snapFn([device.getName()]));
};

/**
 * request to start a facetime call with user. 
 * @param username : `[<name>]` of user to call
 * @return promise to provide the file name if successful
 */
export const facetimeFn = (username:string[]):Promise<{message:string}> => {
    const user = users.userByName(username[0]);
    log.info('trying facetime call to ' + user.name); 
    return osaCommands.facetime(user.AppleID)
    .then((result) => { return {message: result}; });
};

/**
 * request to say a string of text. 
 * @param text : `[<text>]` to say
 * @return promise to provide the result if successful
 */
export const sayFn = (msg:string[]):Promise<{message:string}> => { 
    return osaCommands.say(msg[0])
    .then((result) => { return {message: result}; });
};

/**
 * arms all armable devices. If `away` is specified, it also sets the device's audible alarm repsonses 
 * @param param `[away]`
 */
export const armFn = (param:string[]):Promise<{message:string}> => {
    const audible = (param[0] === 'away');
    const devices = DeviceList.getDevices().filter(d => d.hasAlarm());

    return Promise.all(
        devices.map((d:AlarmDevice) => 
            d.setAudible(audible)
            .then(() => d.arm(true))
            .then((b:boolean) => `${d.getName()} ${b?'armed':'??'} ${d.getAudible()?'with siren':''}`)
        )
    )
    .then((results:string[]) => {
        log.debug(`devices armed: ${log.inspect(results)}`);
        return {message: results.join('\n')};
    })
    .catch(log.error);
};

export const disarmFn = ():Promise<{message:string}> => {
    const devices = DeviceList.getDevices().filter(d => d.hasAlarm());

    return Promise.all(
        devices.map((d:AlarmDevice) => 
            d.arm(false)
            .then((b:boolean) => `${d.getName()} ${b?'disarmed':'??'}`)
        )
    )
    .then((results:string[]) => {
        log.info(`devices disarmed: ${log.inspect(results)}`);
        return {message: results.join('\n')};
    })
    .catch(log.error);
};
    
export const armingStatusFn = ():Promise<{message:{[x:string]:boolean}[]}> => {
    const alarmDevices = DeviceList.getDevices()
        .filter((dev:Device) => dev.hasAlarm());
    return armingCall(alarmDevices.map((dev:AlarmDevice) => dev.armStatus()))
    .then(() => { return { message: alarmDevices.map((dev:AlarmDevice) => { return {[dev.getName()]: dev.isArmed()};})};});
};

/**
 * 
 * @param param `[on|off]`
 */
export const lightFn = (param:string[]):Promise<{message:boolean}> => {
    let opt = param[0];
    log.info('lights on/off ' + opt);
//    return osaCommands.email((opt==='on')? IFTTT_On : IFTTT_Off, IFTTT_Address);
    return Promise.resolve({message: false});
};

