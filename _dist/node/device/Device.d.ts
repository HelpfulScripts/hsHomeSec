import { Settings } from '../core/Settings';
import { FtpSettings } from '../comm/ftpSrv';
export interface DeviceSettings {
    id: string;
    name: string;
    type: string;
    host: string;
    prot: string;
    port: number;
    recDir?: string;
    user?: string;
    passwd?: string;
}
export interface Device {
    initDevice(settings: Settings): void;
    getSettings(): DeviceSettings;
    getName(): string;
    hasVideo(): boolean;
    hasAudio(): boolean;
    hasAlarm(): boolean;
}
export interface AlarmDevice extends Device {
    hasAlarm(): boolean;
    armStatus(): Promise<boolean>;
    arm(arm: boolean): Promise<boolean>;
    isArmed(): boolean;
    setAudible(audible: boolean): Promise<boolean>;
    getAudible(): boolean;
}
export interface Camera extends Device {
    hasVideo(): boolean;
    hasAudio(): boolean;
    setRecordingDir(recDir: string): Promise<string>;
    getRecordingDir(): Promise<string>;
    snapPicture(): Promise<any>;
    getFtpCfg(): Promise<any>;
    setFtpCfg(ftpSettings: FtpSettings): Promise<boolean>;
    testFtpServer(): Promise<boolean>;
}
export declare abstract class AbstractDevice implements Device {
    private settings;
    hasVideo(): boolean;
    hasAudio(): boolean;
    hasAlarm(): boolean;
    hasMotionAlarm(): boolean;
    constructor(deviceSettings: DeviceSettings, settings: Settings);
    initDevice(settings: Settings): void;
    getSettings(): DeviceSettings;
    getName(): string;
}
export declare abstract class AbstractCamera extends AbstractDevice implements Camera, AlarmDevice {
    private audible;
    protected armed: boolean;
    constructor(device: DeviceSettings, settings: Settings);
    initDevice(settings: Settings): void;
    hasVideo(): boolean;
    hasAlarm(): boolean;
    isArmed(): boolean;
    setRecordingDir(recDir: string): Promise<string>;
    getRecordingDir(): Promise<string>;
    abstract snapPicture(): Promise<any>;
    abstract getFtpCfg(): Promise<FtpSettings>;
    abstract setFtpCfg(): Promise<boolean>;
    abstract testFtpServer(): Promise<boolean>;
    abstract armStatus(): Promise<boolean>;
    abstract arm(arm: boolean): Promise<boolean>;
    setAudible(audible: boolean): Promise<boolean>;
    getAudible(): boolean;
    protected sendCommandToDevice(cmd: string, dynData?: any): Promise<any>;
}
export declare class DeviceList {
    private static list;
    static addDevice(device: Device): void;
    static getDevice(name: string): Device;
    static getDevices(): Device[];
}
