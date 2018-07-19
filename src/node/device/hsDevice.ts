
import { Log }      from 'hsnode';   const log = new Log('hsDevice');
import { fs }       from 'hsnode'; 
import { Settings } from '../core/hsSettings';

export interface DeviceSettings {
    id:         string;         // unique device name
    name:       string;         // colloquial device name
    type:       string;         // 'foscam', 'wansview'
    host:       string;         // IP number of device
    prot:       string;         // http or https
    port:       number;         // port number on device
    recDir?:    string;         // where to store device recordings, absolute path
//    devices:    Device[];       // list of all registered devices
//    cameras:    Camera[];       // list of all camera devices registered
//    alarmDevs:  AlarmDevice[];  // list of all alarm raising devices
    user?:      string;
    passwd?:    string;
}

export interface Device {
    initDevice(settings:Settings):void;
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
     * promises to set the device's ftp confguration. 
     * @return Promise a promise that resolves to undefined. 
     */
    setFtpCfg():Promise<boolean>;

    /**
     * gets the device's ftp confguration and calls `cb`. 
     * @return Promise a promise that resolves to the testResult: 0 = success, -1 = failure, -3 = unknown 
     */
    testFtpServer():Promise<boolean>;
}

export class DeviceList {
    private static list = <Device[]>[];
    static addDevice(device: Device) {
        const settings = device.getSettings();
        if (!settings.name) { log.error('device name missing'); }
        if (!settings.host) { log.error('device host missing'); }
        if (!settings.port) { log.error('device port missing'); }
        DeviceList.list.push(device);
        // reference device by both short name and unique ID
        DeviceList.list[settings.name] = device;
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

export abstract class AbstractDevice implements Device {
    private settings: DeviceSettings;

    hasVideo():boolean          { return false; }
    hasAudio():boolean          { return false; }
    hasAlarm():boolean          { return false; }
    hasMotionAlarm():boolean    { return false; }

    constructor(deviceSettings: DeviceSettings, settings:Settings) {
        this.settings = deviceSettings;
        DeviceList.addDevice(this);
    }

    initDevice(settings:Settings) {}

    getSettings():DeviceSettings {
        return this.settings;
    }

    getName():string {
        return this.settings.name;
    }

}

export abstract class AbstractCamera extends AbstractDevice implements Camera, AlarmDevice {
    private audible = false;
    protected armed   = false;

    constructor(device: DeviceSettings, settings:Settings) {
        super(device, settings);
    }
    
    initDevice(settings:Settings) {
        super.initDevice(settings);
        this.setRecordingDir(settings.homeSecDir + (settings.recDir || ''));
    }

    hasVideo():boolean  { return true; } 
    hasAlarm():boolean  { return true; }
    isArmed():boolean   { return this.armed; }

    /**
     * sets the global snapshot directory.
     * @param recDir absolute path to write recordings to
     * @return Promise a promise that always resolves to True. 
     */
    setRecordingDir(recDir:string):Promise<string> {
        return fs.realPath(recDir).then((p:string) => {
            this.getSettings().recDir = p;
            log.debug(`${this.getName()} recording directory set to ${this.getSettings().recDir}`);
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
     * gets the device's ftp confguration and calls `cb`. 
     * @param function cb the function to call with the result
     */
    abstract getFtpCfg():Promise<any> ;

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
        return log.info(`${this.getName()} audible: ${this.audible}`)
        .then(() => true);
    }

    getAudible() {
        return this.audible;
    }
}
    