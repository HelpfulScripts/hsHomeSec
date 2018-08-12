/**
 * functions to interface with WansView devices.
 */
import { http }             from 'hsnode';
//import { fs  }              from 'hsnode';
import { inspect }          from 'util';
//import { date }             from 'hsutil';
import { DeviceSettings }   from './Device';
import { Settings }         from '../core/Settings';
import { AbstractCamera }   from './Device';
import * as ftp             from '../comm/ftpSrv';
import { date }             from 'hsutil';

const audioSensitivity = 5;     // 1 - 10
const videoSensitivity = 95;    // 1 - 100 ??

export class WansView extends AbstractCamera {
    protected path = '';

    constructor(device: DeviceSettings, settings:Settings) {
        super(device, settings); 
        this.path = `/hy-cgi/`;

    }

    initDevice(settings:Settings) {
        super.initDevice(settings);
        this.setOverlayText()
        .then(()=>this.setTime());
    }

    standardSend(cmd:string, name:string) {
        return this.sendCommandToDevice(cmd)
            .then((receivedData:http.HttpResponse) => { 
                this.log.debug(`standardSend '${cmd}' result:\n${this.log.inspect(receivedData.body, null)}`);
                if ((typeof receivedData.body === 'string') && (receivedData.body.match(/Success/))) {
                    this.log.info(`${name} success`);
                    return true;
                } else {
                    this.log.info(`${name} failure: ${this.log.inspect(receivedData.body, null)}`);
                    return false;
                }
            })
            .catch(err => {
                this.log.error('error '+err);
                return false;
            });
    }

    setTime(): Promise<any> {
        const cmd = `${this.path}device.cgi?cmd=setsystime&stime=${date('%YYYY-%MM-%DD;%hh:%mm:%ss')}&timezone=6`;
        return this.standardSend(cmd, 'setTime');
    }

    setOverlayText():Promise<any> {
        const cmd = `${this.path}av.cgi?cmd=setosdattr&region=0&show=1&cmd=setosdattr&region=1&show=1&name=${this.getName()}`;
        return this.standardSend(cmd, 'setOverlayText');
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
                this.log.debug('get snapshot:' + src);
                return this.sendCommandToDevice(src);
            })
            .catch(this.log.error.bind(this.log));
        }

    /**
     * gets the device's ftp confguration and calls `cb`. 
     * @param string deviceName the name of the device
     * @param function cb the function to call with the result
     */
    getFtpCfg():Promise<any> {
        const cmd = `${this.path}ftp.cgi?cmd=getftpattr`;
        this.log.info(`setting FTP config`);
        return this.sendCommandToDevice(cmd)
            .then((receivedData:http.HttpResponse) => { 
                this.log.debug('get ftp config:' + inspect(receivedData.body));
                const result = {};
                receivedData.body.replace(/var /g, '').replace(/\n/g, '').split(';').map((p:any) => { p = p.split('='); if (p[1]) { result[p[0]] = p[1].replace(/\'/g, ''); }});
                this.log.info(`ftp config: \n${this.log.inspect(result, null)}`);
                return result;
            })
            .catch(err => {
                this.log.error('error'+err);
            });
    }

    /**
     * promises to set the device's ftp confguration. 
     * @param string deviceName the name of the device
     * @return Promise a promise that resolves to undefined. 
     */
    setFtpCfg():Promise<boolean> {
        const ftpSettings = ftp.getSettings();
        const cmd = `${this.path}ftp.cgi?cmd=setftpattr&ft_server=${ftpSettings.host}&ft_port=${ftpSettings.port}&ft_username=${ftpSettings.user}&ft_password=${ftpSettings.pwd}&ft_dirname=./`;
        return this.standardSend(cmd, 'setFtpCfg');
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
                this.log.debug('ftp server test1:' + receivedData.url + '\n' + inspect(receivedData));
                if (receivedData.testResult !== '0') { throw new Error('testFtpServer failed: ' + receivedData.testResult);}
                return receivedData;
            })
            .then(() => this.sendCommandToDevice(cmd2))
            .then((receivedData:any) => { 
                this.log.debug('ftp server test2:' + receivedData.url + '\n' + inspect(receivedData));
                if (receivedData.testResult !== '0') { throw new Error('testFtpServer failed: ' + receivedData.testResult);}
                return receivedData;
            })
            .catch(this.log.error.bind(this.log));
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
                this.log.error(err);
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
        /* audioTime   */ `cmd=setalarmbeepattr&audiotime=5`,
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
        
        if (!this.getSettings().useAlarm) { 
            this.armed = false;
            return Promise.resolve(false); 
        }
        const cmd = `${this.path}alarm.cgi?${cmds.join('&')}`;
        return this.sendCommandToDevice(cmd)        
            .then((result) => this.armed = result)  // resolves to the arming status of the device (true or false)
            .then((result) => {
                const successes = result.data.split('\n');
                let success = successes[0] === 'Success';
                this.log.debug(`individual arm results: (${typeof result.data}) ${this.log.inspect(result.data)}`);
                successes.forEach((s:string, i:number) => { if(s && s!=='Success') { this.log.warn(`Command '${cmds[i]}' reported error '${s}'`); }});
                this.log.debug(`arm result: ${success? 'successful' : 'error'}`);
                if (success!==true) {
                    this.log.warn(`received data: ${this.log.inspect(result.data, null)}`);
                    success = result.data.indexOf('Success') === 0;
                    if (success!==true) {
                        this.log.error(`setting motion detect not successful`);
                    }
                } 
                return success;
            })
            .catch(err => {
                this.log.error(err);
                return this.armStatus();
            });
    }
}
