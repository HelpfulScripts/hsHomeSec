/**
 * functions to interface with WansView devices.
 */
import { Log }              from 'hsnode';  const log = new Log('WansView');
import { http }             from 'hsnode';
//import { fs  }              from 'hsnode';
import { inspect }          from 'util';
//import { date }             from 'hsutil';
import { DeviceSettings }   from './hsDevice';
import { Settings }         from '../core/hsSettings';
import { AbstractCamera }   from './hsDevice';
import * as ftp             from '../comm/ftpSrv';


const audioSensitivity = 5;     // 1 - 10
const videoSensitivity = 95;    // 1 - 100 ??

export class WansView extends AbstractCamera {
    protected path = '';

    constructor(device: DeviceSettings, settings:Settings) {
        super(device, settings); 
        log.prefix(`WansView ${device.name}`);
        this.path = `/hy-cgi/`;

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
        const cmd = `${this.path}av.cgi?cmd=manualsnap&chn=0`;
        return this.sendCommandToDevice(cmd)
            .then((res:http.HttpResponse) => { 
                const path = res.body.toString().split('=');
                const src = path[1].replace(';','').trim();
                log.debug('get snapshot:' + src);
                const dyn = { path: src };
                return this.sendCommandToDevice(cmd, dyn);
            })
            .catch(log.error.bind(log));
        }

    /**
     * gets the device's ftp confguration and calls `cb`. 
     * @param string deviceName the name of the device
     * @param function cb the function to call with the result
     */
    getFtpCfg():Promise<any> {
        const cmd = `${this.path}ftp.cgi?cmd=getftpattr`;
        return this.sendCommandToDevice(cmd)
            .then((receivedData:http.HttpResponse) => { 
                log.debug('get ftp config:' + inspect(receivedData.body));
                const result = {};
                receivedData.body.replace(/var /g, '').replace(/\n/g, '').split(';').map((p:any) => { p = p.split('='); if (p[1]) { result[p[0]] = p[1].replace(/\'/g, ''); }});
                log.info(`ftp config: \n${log.inspect(result, null)}`);
                return result;
            })
            .catch(err => {
                log.error('error'+err);
            });
    }

    /**
     * promises to set the device's ftp confguration. 
     * @param string deviceName the name of the device
     * @return Promise a promise that resolves to undefined. 
     */
    setFtpCfg():Promise<boolean> {
        const ftpSettings:ftp.FtpSettings = ftp.get();
        const cmd = `${this.path}ftp.cgi?cmd=setftpattr&ft_server=${ftpSettings.host}&ft_port=${ftpSettings.port}&ft_username=${ftpSettings.user}&ft_password=${ftpSettings.pwd}&ft_dirname=./`;
        return this.sendCommandToDevice(cmd)
            .then((receivedData:http.HttpResponse) => { 
                log.info('set ftp config:' + inspect(receivedData.body).trim());
                return true;
            })
            .catch(err => {
                log.error('error'+err);
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
        const cmd1 = `${this.path}ftp.cgi?cmd=testftp`;
        const cmd2 = `${this.path}ftp.cgi?cmd=testftpresult`;
        return this.sendCommandToDevice(cmd1)
            .then((receivedData:any) => { 
                log.debug('ftp server test1:' + receivedData.url + '\n' + inspect(receivedData));
                if (receivedData.testResult !== '0') { throw new Error('testFtpServer failed: ' + receivedData.testResult);}
                return receivedData;
            })
            .then(() => this.sendCommandToDevice(cmd2))
            .then((receivedData:any) => { 
                log.debug('ftp server test2:' + receivedData.url + '\n' + inspect(receivedData));
                if (receivedData.testResult !== '0') { throw new Error('testFtpServer failed: ' + receivedData.testResult);}
                return receivedData;
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
        const cmd = `${this.path}cmd=setalarmact&aname=alarmbeep&switch=on&cmd=setalarmbeepattr&audiotime=1`;
        // results in {motionDetectAlarm: '0'- disarmed, '1'-no alarm, '2'- detect alarm}
        return this.sendCommandToDevice(cmd)  
            // resolves to True (armed) of False (disarmed)
            .then((result:any) => this.armed = (result.motionDetectAlarm !== '0'))   
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
        const audio = this.getAudible();
        const cmds = [
        /* motionDetect*/ `cmd=setmdattr&enable=${arm?1:0}&sensitivity=${videoSensitivity}&left=0&top=0&right=1920&bottom=1080&index=0&name=MD0`,
        /* audioDetect */ `cmd=setaudioalarmattr&aa_enable=${arm?1:0}&aa_value=${audioSensitivity}`,
        /* audioAlert  */ `cmd=setalarmact&aname=alarmbeep&switch=${audio?'on':'off'}`,
        /* audioTime   */ `cmd=setalarmbeepattr&audiotime=1`,
        /* emailsnap   */ `cmd=setalarmact&aname=emailsnap&switch=off`,
        /* SDcardSnap  */ `cmd=setalarmact&aname=snap&switch=off`,
        /* SDcardRecord*/ `cmd=setalarmact&aname=record&switch=off`,
        /* ftpSnap     */ `cmd=setalarmact&aname=ftpsnap&switch=on`,
        /* ftpRecord   */ `cmd=setalarmact&aname=ftprec&switch=on`,
        /* preset      */ `cmd=setalarmact&aname=preset&switch=off`,
        /* relay       */ `cmd=setrelayattr&time=5&cmd=setalarmact&aname=relay&switch=off`,
        /* motor       */ `cmd=setmotorattr&alarmpresetindex=1`,
        /* other       */ `cmd=setalarmact&aname=type&switch=off`
        ];
        
        const cmd = `${this.path}alarm.cgi?${cmds.join('&')}`;
        return this.sendCommandToDevice(cmd)        
            .then((result) => this.armed = result)  // resolves to the arming status of the device (true or false)
            .then((result) => {
                const successes = result.data.split('\n');
                let success = successes[0] === 'Success';
                log.debug(`individual arm results: (${typeof result.data}) ${result.data}`);
                successes.forEach((s:string, i:number) => { if(s!=='Success') { log.warn(`Command '${cmds[i]}' reported error '${s}'`); }});
                log.debug(`arm result: ${success? 'successful' : 'error'}`);
                if (success!==true) {
                    log.warn(`received data: ${log.inspect(result.data, null)}`);
                    success = result.data.indexOf('Success') === 0;
                    if (success!==true) {
                        log.error(`setting motion detect not successful`);
                    }
                } 
                return success;
            })
            .catch(err => {
                log.error(err);
                return this.armStatus();
            });
    }
}
