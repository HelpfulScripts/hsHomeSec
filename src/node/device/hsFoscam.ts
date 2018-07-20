/**
 * @ngdoc object
 * @name hsAlarmServer.hsFoscam
 * @description functions to interface with foscam devices.
 */
import { http }             from 'hsnode';
import { Log }              from 'hsnode';   const log = new Log('Foscam');
import { DeviceSettings }   from './hsDevice';
import { AbstractCamera }   from './hsDevice';
import { Settings }         from '../core/hsSettings';
import * as ftp             from '../comm/ftpSrv';

let   armCmd       = 'setMotionDetectConfig&isEnable=1';
const disarmCmd    = 'setMotionDetectConfig&isEnable=0';
const statusCmd    = 'getDevState';
const getFtpCmd    = 'getFtpConfig';
const ring         = 1;
const linkage      = 4+8; // ring:1, mail:2, pic:4, vid:8
const snapInterval = 1;   // in seconds
const sensitivity  = '1'; // low - high: 4, 3, 0, 1, 2


export class Foscam extends AbstractCamera {  
    constructor(device: DeviceSettings, settings:Settings) {
        super(device, settings);
        log.prefix(`Foscam ${device.name}`);
        this.path = `/cgi-bin/CGIProxy.fcgi?usr=${device.user}&pwd=${device.passwd}&cmd=`;
        let schedule    = '';
        let area        = '';
        for (let i=0; i<7; i++)  { schedule = schedule + '&schedule' + i + '=281474976710655'; }
        for (let i=0; i<10; i++) { area = area + '&area' + i + '=1023'; }
        armCmd = armCmd  +
            '&sensitivity=' + sensitivity +
            schedule + area +
            '&snapInterval=' + snapInterval + 
            '&triggerInterval=5';    
    }

    initDevice(settings:Settings) {
        super.initDevice(settings);
        this.setFtpCfg();
    }

    /**
     * captures a snapshot from the device and saves it to gSnapshotDir
     * @param string deviceName the name of the device
     */
    snapPicture():Promise<any> {
        const cmd = 'snapPicture';
        return this.sendCommandToDevice(cmd)
        .then((res:http.HttpResponse) => {
            const src = res.body.html.body.img.attrs.src;
            log.debug(`get snapshot: ${src}`);
            const dyn = { path: src };
            return this.sendCommandToDevice(cmd, dyn);    // no command word triggers simple request for options.path
        })
        .catch(log.error.bind(log));
    }

    /**
     * gets the device's ftp confguration and calls `cb`. 
     */
    getFtpCfg():Promise<any> {
        return this.sendCommandToDevice(getFtpCmd)
        .then((res:http.HttpResponse) => { 
            log.info(`ftp config = \n${log.inspect(res.body)}`); 
            return res.body; 
        })
        .catch(log.error.bind(log));
    }

    /**
     * promises to set the device's ftp confguration. 
     * The promsie resolves to true orfalse, depending on the success of the call
     */
    setFtpCfg():Promise<boolean> {
        const ftpSettings = ftp.get();
        const cmd = `setFtpConfig&ftpAddr=ftp://${ftpSettings.host}/&ftpPort=${ftpSettings.port}&mode=0&userName=${ftpSettings.user}&password=${ftpSettings.pwd}`;
        return this.sendCommandToDevice(cmd)
            .then((res:http.HttpResponse) => { 
                log.info(`setFtpCfg ${(res.body.result === '0')?'success':'failure'}`);
                return res.body.result === 0;
            })
            .catch(err => {
                log.error(err);
                return false;
            });
    }

    /**
     * gets the device's ftp confguration and calls `cb`. 
     * @param string deviceName the name of the device
     * @param function cb the function to call with the result
     * @return Promise a promise that resolves to the testResult: 0 = success, -1 = failure, -3 = unknown 
     */
    testFtpServer():Promise<boolean> {
        const ftpSettings = ftp.get();
        const cmd = `testFtpServer&ftpAddr=ftp://${ftpSettings.host}/&ftpPort=${ftpSettings.port}&mode=0&userName=${ftpSettings.user}&password=${ftpSettings.pwd}`;
        return this.sendCommandToDevice(cmd)
        .then((res:http.HttpResponse) => { 
            const result = res.body.testResult === '0';
            log[result?'info':'error'](`ftp server test ${result?'succeeded':'failed'}`);
            return result;
        })
        .catch(log.error.bind(log));
    }

    /**
     * promises to check whether the device is armed or not. 
     * @param string deviceName the name of the device
     * @param function cb the function to call with the result
     * @return Promise a promise that resolves to True (status: armed) or False (status: disarmed). 
     */
    armStatus():Promise<boolean> {
        // results in {motionDetectAlarm: '0'- disarmed, '1'-no alarm, '2'- detect alarm}
        return this.sendCommandToDevice(statusCmd)  
            // resolves to True (armed) of False (disarmed)
            .then((result:any) => this.armed = (result.body.motionDetectAlarm !== '0'))   
            .catch(err => {
                log.error(err);
                throw err;
            });
    }

    /**
     * returns a promise to arm or disarm the device.
     * @param string deviceName the name of the device
     * @param boolean arm `true` will arm, `false` will disarm the device.
     * @return Promise a promise that resolves to True (status: armed) or False (status: disarmed). 
     */
    arm(arm:boolean):Promise<boolean> {
        const cmd = arm? (armCmd+'&linkage=' + (linkage + (this.getAudible()?ring:0))) : disarmCmd;
        return this.sendCommandToDevice(cmd)        
            .then((result) => this.armed = result.body)  // resolves to the arming status of the device (true or false)
            .catch(err => {
                log.error(err);
                throw err;
            });
    }
}


