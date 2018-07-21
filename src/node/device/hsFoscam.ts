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

let   armCmd       = '';
const snapInterval = 1;   // in seconds
const sensitivity  = '1'; // low - high: 4, 3, 0, 1, 2

const linkage = {
    audio:  1,
    mail:   2,
    pic:    4,
    video:  8
};



export class Foscam extends AbstractCamera {  
    protected path = '';

    constructor(device: DeviceSettings, settings:Settings) {
        super(device, settings);
        log.prefix(`Foscam ${device.name}`);
        this.path = `/cgi-bin/CGIProxy.fcgi?usr=${device.user}&pwd=${device.passwd}&cmd=`;
        let schedule    = '';
        let area        = '';
        for (let i=0; i<7; i++)  { schedule = schedule + '&schedule' + i + '=281474976710655'; }
        for (let i=0; i<10; i++) { area = area + '&area' + i + '=1023'; }
        armCmd = `setMotionDetectConfig${schedule}${area}`;    
    }

    initDevice(settings:Settings) {
        super.initDevice(settings);
    }

    /**
     * captures a snapshot from the device and saves it to gSnapshotDir
     * @param string deviceName the name of the device
     */
    snapPicture():Promise<any> {
        const cmd = `${this.path}snapPicture`;
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
        const cmd = `${this.path}getFtpConfig`;
        return this.sendCommandToDevice(cmd)
        .then((res:http.HttpResponse) => { 
            const result = res.body.CGI_Result;
            if (result.result === '0') {
                result.ftpAddr = unescape(result.ftpAddr);
                log.info(`ftp config = \n${log.inspect(result)}`); 
                return result; 
            } else {
                log.error(`ftp config result=${result.result}: \n${log.inspect(result)}`);
                return result;
            }
        })
        .catch(log.error.bind(log));
    }

    /**
     * promises to set the device's ftp confguration. 
     * The promsie resolves to true orfalse, depending on the success of the call
     */
    setFtpCfg():Promise<boolean> {
        const ftpSettings = ftp.getSettings();
        const cmd = `${this.path}setFtpConfig&ftpAddr=ftp://${ftpSettings.host}/&ftpPort=${ftpSettings.port}&mode=0&userName=${ftpSettings.user}&password=${ftpSettings.pwd}`;
        return this.sendCommandToDevice(cmd)
            .then((res:http.HttpResponse) => { 
                const success = res.body.CGI_Result.result === '0';
                log.info(`setFtpCfg ${success?'success':'failure'}`);
                log.debug(`res: ${log.inspect(res.body, null)}`);
                return success;
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
        const ftpSettings = ftp.getSettings();
        const cmd = `${this.path}testFtpServer&ftpAddr=ftp://${ftpSettings.host}/&ftpPort=${ftpSettings.port}&mode=0&userName=${ftpSettings.user}&password=${ftpSettings.pwd}`;
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
        const cmd = `${this.path}getDevState`;
        // results in {motionDetectAlarm: '0'- disarmed, '1'-no alarm, '2'- detect alarm}
        return this.sendCommandToDevice(cmd)  
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
        const link = linkage.pic + linkage.video + (this.getAudible()? linkage.audio : 0);
        const cmd = `${this.path}${armCmd}&isEnable=${arm?1:0}&linkage=${link}&sensitivity=${sensitivity}&snapInterval=${snapInterval}&triggerInterval=5`;
        return this.sendCommandToDevice(cmd)        
            .then((res) => {
                const success = res.body.CGI_Result.result === '0';
                log.debug(`arm result: ${success? 'successful' : 'error'}`);
                if (!success) { 
                    log.error(`received data: ${log.inspect(res.data, null)}`);
                } 
                return this.armed = success;
            })  // resolves to the arming status of the device (true or false)
            .catch(err => {
                log.error(err);
                return this.armStatus();
            });
    }
}


