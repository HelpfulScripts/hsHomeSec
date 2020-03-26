
import { URL }              from 'url';
import * as node  from 'hsnode';  const log = new node.Log('Device');
import { http }             from 'hsnode';
import { CfgSettings }      from '../core/CfgSettings';
import { FtpSettings }      from '../comm/ftpSrv';

const fs = node.node.fs;

export interface DeviceSettings {
    id:         string;         // unique device name
    name:       string;         // colloquial device name
    type:       string;         // 'foscam', 'wansview'
    host:       string;         // IP number of device
    prot?:      string;         // http or https
    port:       number;         // port number on device
    useAlarm?:  boolean;        // whether to include when arming, default: true
    recDir?:    string;         // where to store device recordings, absolute path
    user?:      string;
    passwd?:    string;
}

export interface Device {
    initDevice(settings:CfgSettings):Promise<void>;
    setTime():Promise<void>;
    getSettings():DeviceSettings;
    getName():string;
    hasVideo():boolean;
    hasAudio():boolean;
    hasAlarm():boolean;
}

export interface AlarmDevice extends Device {
    hasAlarm():boolean;

    /**
     * promises to check whether the device is armed or not. 
     * @return Promise a promise that resolves to True (status: armed) or False (status: disarmed). 
     */
    armStatus():Promise<boolean>;

    /**
     * returns a promise to arm or disarm the device.
     * @param arm `true` will arm, `false` will disarm the device.
     * @return Promise a promise that resolves to True (status: armed) or False (status: disarmed). 
     */
    arm(arm:boolean):Promise<boolean>;

    isArmed():boolean;
    
    /**
     * sets the global audible flag. If the flag is set to true, 
     * devices will sound an audible alarm after the next time they are armed.
     * @param audible the name of the device
     * @return Promise a promise that always resolves to True. 
     */
    setAudible(audible:boolean):Promise<boolean>;

    /** returns the current value of the audible flag */
    getAudible():boolean;
}

export interface Camera extends Device {
    hasVideo():boolean;
    hasAudio():boolean;
    hasPTZ():boolean;

    /**
     * sets the global snapshot directory.
     * @param recDir path to write snapshots to
     * @return Promise a promise that always resolves to True. 
     */
    setRecordingDir(recDir:string):Promise<string>;
    /** 
     * get absolute path on host system to where to store recordings 
     */
    getRecordingDir():Promise<string>;

    /**
     * captures a snapshot from the device and saves it to `snapshotDir`
     */
    snapPicture():Promise<any>;

    /**
     * gets the device's ftp confguration and calls `cb`. 
     * @param function cb the function to call with the result
     */
    getFtpCfg():Promise<any>;

    /**
     * moves the camera to a preset position
     * @param index the preset position index to move to
     */
    ptzPreset(index:number):Promise<any>;

    /**
     * promises to set the device's ftp confguration. 
     * @return Promise a promise that resolves to undefined. 
     */
    setFtpCfg(ftpSettings:FtpSettings):Promise<boolean>;

    /**
     * gets the device's ftp confguration and calls `cb`. 
     * @return Promise a promise that resolves to the testResult: 0 = success, -1 = failure, -3 = unknown 
     */
    testFtpServer():Promise<boolean>;
}

export abstract class AbstractDevice implements Device {
    private settings: DeviceSettings;
    protected log: typeof log;

    hasVideo():boolean          { return false; }
    hasAudio():boolean          { return false; }
    hasAlarm():boolean          { return false; }
    hasMotionAlarm():boolean    { return false; }
    abstract async setTime():Promise<void>;

    constructor(deviceSettings: DeviceSettings, settings:CfgSettings) {
        this.settings = deviceSettings;
        DeviceList.addDevice(this);
        this.log = new node.Log(`${deviceSettings.type} ${deviceSettings.name}`);
    }

    async initDevice(settings:CfgSettings) {}

    getSettings():DeviceSettings {
        return this.settings;
    }

    getName():string {
        return this.settings.name;
    }

}

export abstract class AbstractCamera extends AbstractDevice implements Camera, AlarmDevice {
    private audible     = false;
    protected armed     = false;

    constructor(device: DeviceSettings, settings:CfgSettings) {
        super(device, settings);
        if (device.useAlarm === undefined) { device.useAlarm = true; }
    }
    
    async initDevice(settings:CfgSettings) {
        await super.initDevice(settings);
        await this.setRecordingDir(`${settings.homeSecDir}/${settings.recDir || ''}`);
        await this.setFtpCfg();
        await this.setTime();
    }

    hasVideo():boolean  { return true; } 
    hasAlarm():boolean  { return true; }
    isArmed():boolean   { return this.armed; }
    hasPTZ():boolean    { return false; }

    /**
     * sets the global snapshot directory.
     * @param recDir absolute path to write recordings to
     * @return Promise a promise that always resolves to True. 
     */
    setRecordingDir(recDir:string):Promise<string> {
        return fs.realPath(recDir).then((p:string) => {
            this.getSettings().recDir = p;
            this.log.debug(`${this.getName()} recording directory set to ${this.getSettings().recDir}`);
            return p;
        });
    }

    getRecordingDir(): Promise<string>  { 
        return Promise.resolve(this.getSettings().recDir);
    }

    /**
     * captures a snapshot from the device and saves it to `snapshotDir`
     */
    abstract snapPicture():Promise<any>;

    /**
     * Moves the camera to a preset position. 
     * This default implementation returns an empty promise.
     * @param index the preset position index to move to
     */
    ptzPreset(index:number):Promise<any> { return Promise.resolve(); }

    /**
     * gets the device's ftp confguration and calls `cb`. 
     * @param function cb the function to call with the result
     */
    abstract getFtpCfg():Promise<FtpSettings> ;

    /**
     * promises to set the device's ftp confguration. 
     * @return Promise a promise that resolves to undefined. 
     */
    abstract setFtpCfg():Promise<boolean>;

    /**
     * gets the device's ftp confguration and calls `cb`. 
     * @return Promise a promise that resolves to the testResult: 0 = success, -1 = failure, -3 = unknown 
     */
    abstract testFtpServer():Promise<boolean>;

    /**
     * promises to check whether the device is armed or not. 
     * @return Promise a promise that resolves to True (status: armed) or False (status: disarmed). 
     */
    abstract armStatus():Promise<boolean>;

    /**
     * returns a promise to arm or disarm the device.
     * @param arm `true` will arm, `false` will disarm the device.
     * @return Promise a promise that resolves to True (status: armed) or False (status: disarmed). 
     */
    abstract arm(arm:boolean):Promise<boolean>;

    /**
     * sets the global audible flag. If the flag is set to true, 
     * devices will sound an audible alarm after the next time they are armed.
     * @param audible the name of the device
     * @return Promise a promise that always resolves to True. 
     */
    setAudible(audible:boolean):Promise<boolean> {
        this.audible = (audible===true);
        return this.log.debug(`${this.getName()} audible: ${this.audible}`)
        .then(() => true);
    }

    getAudible() {
        return this.audible;
    }

        /**
     * promised to send `cmd` to the foscam camera specified in `options`
     * @param cmd the command string to send
     * @param dynRef an http options object
     */
    protected sendCommandToDevice(cmd:string, referer?:string):Promise<any> {
        const settings = this.getSettings();
        const Url = new URL(`http://${settings.host}:${settings.port}${cmd}`);
        this.log.debug(`${this.getName()} requesting ${Url.href}`);
        return http.request(Url, new http.Digest(settings.user, settings.passwd), referer)
            .then((r:http.HttpResponse) => {
                this.log.debug(`${this.getName()} received ${r.response.headers['content-type']} for ${cmd}`);
                if (r.response.headers['content-type'].indexOf('text/') >= 0) {
                    r.body = http.xml2json(r.data);
                    this.log.debug(`response: ${this.log.inspect(r.body,null)}`);
                }
                return r;
            })
            .catch(this.log.error.bind(this.log));
    }
}
    
export class DeviceList {
    private static list = <Device[]>[];
    static addDevice(device: Device) {
        const settings = device.getSettings();
        if (!settings.name) { log.error('device name missing'); }
        if (!settings.host) { log.error('device host missing'); }
        if (!settings.port) { log.error('device port missing'); }
        log.debug(`adding device '${device.getName()}'`);
        DeviceList.list.push(device);
        // reference device by both short name and unique ID
        DeviceList.list[settings.name] = device;
        if (!isNaN(<any>settings.id)) { settings.id = 'dev_' + settings.id;}
        DeviceList.list[settings.id]   = device;
    }

    static getDevice(name:string):Device {
        return DeviceList.list[name];
    }

    /** returns a copy of the device list */
    static getDevices():Device[] {
        return this.list.slice(0);
    }
}

