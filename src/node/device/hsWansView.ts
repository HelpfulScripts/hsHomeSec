/**
 * functions to interface with WansView devices.
 */
import { URL }              from 'url';
import { Log }              from 'hsnode';  const log = new Log('WansView');
import { http }             from 'hsnode';
//import { fs  }              from 'hsnode';
import { inspect }          from 'util';
//import { date }             from 'hsutil';
import { DeviceSettings }   from './hsDevice';
import { Settings }         from '../core/hsSettings';
import { AbstractCamera }   from './hsDevice';
import * as ftp             from '../comm/ftpSrv';

let   armCmd       = '';
const disarmCmd    = '';
const statusCmd    = '';
const ring         = 1;
const linkage      = 4+8; // ring:1, mail:2, pic:4, vid:8
//const snapInterval = 1;   // in seconds


export class WansView extends AbstractCamera {
    
    /**
     * promised to send `cmd` to the foscam camera specified in `options`
     * @param cmd the command string to send
     * @param {dynData an http options object
     */
    private sendCommandToDevice(cmd:string, dynData:any={}):Promise<any> {
//        let binary = false;
        const settings = this.getSettings();
        log.debug(`requesting ${cmd}`);
        const Url = new URL(`http://${settings.user}:${settings.passwd}@${settings.host}:${settings.port}${cmd}`);
        const options = {
            host:       Url.host,
            hostname:   Url.hostname,
            port:       Url.port,
            method:     'GET',
            path:       Url.pathname+Url.search,
            protocol:   Url.protocol,
            headers:    { 'User-Agent': 'helpful scripts' },
            username:   Url.username,
            password:   Url.password
        };
        return http.get(options)
        .then((r:http.HttpResponse) => {
            log.debug(`${r.response.headers['content-type']} received for ${cmd}`);
            if (r.response.headers['content-type']==='text/html') {
                r.body = http.decodeXmlResult(r.data);
            }
            return r;
        })
        .catch((error:any) => {
            log.error(`error received`);
            log.error(log.inspect(error));
        });

    }

    constructor(device: DeviceSettings, settings:Settings) {
        super(device, settings); 
        log.prefix(`WansView ${device.name}`);
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
        const cmd = '/hy-cgi/av.cgi?cmd=manualsnap&chn=0';
        return this.sendCommandToDevice(cmd)
            .then((receivedData:http.HttpResponse) => { 
                const path = receivedData.body.toString().split('=');
                const url = path[1].replace(';','').trim();
                log.debug('get snapshot:' + url);
                return this.sendCommandToDevice(url);
            })
            .catch(err => {
                log.error('error'+err);
            });
    }

    /**
     * gets the device's ftp confguration and calls `cb`. 
     * @param string deviceName the name of the device
     * @param function cb the function to call with the result
     */
    getFtpCfg():Promise<any> {
        const cmd = '/hy-cgi/ftp.cgi?cmd=getftpattr';
        return this.sendCommandToDevice(cmd)
            .then((receivedData:http.HttpResponse) => { 
                log.info('get ftp config:' + inspect(receivedData.body));
                return receivedData;
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
        const cmd = `/hy-cgi/ftp.cgi?cmd=setftpattr&ft_server=${ftpSettings.host}&ft_port=${ftpSettings.port}&ft_username=${ftpSettings.user}&ft_password=${ftpSettings.pwd}&ft_dirname=./`;
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
        const cmd1 = `/hy-cgi/ftp.cgi?cmd=testftp`;
        const cmd2 = `/hy-cgi/ftp.cgi?cmd=testftpresult`;
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
        // results in {motionDetectAlarm: '0'- disarmed, '1'-no alarm, '2'- detect alarm}
        return this.sendCommandToDevice(statusCmd)  
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
        const cmd = arm? (armCmd+'&linkage=' + (linkage + (this.getAudible()?ring:0))) : disarmCmd;
        return this.sendCommandToDevice(cmd)        
            .then((result) => this.armed = result)  // resolves to the arming status of the device (true or false)
            .catch(err => {
                log.error(err);
                throw err;
            });
    }
}
