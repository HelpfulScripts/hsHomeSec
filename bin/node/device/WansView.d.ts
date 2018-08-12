import { DeviceSettings } from './Device';
import { Settings } from '../core/Settings';
import { AbstractCamera } from './Device';
export declare class WansView extends AbstractCamera {
    protected path: string;
    constructor(device: DeviceSettings, settings: Settings);
    initDevice(settings: Settings): void;
    standardSend(cmd: string, name: string): Promise<boolean>;
    setTime(): Promise<any>;
    setOverlayText(): Promise<any>;
    snapPicture(): Promise<any>;
    ptzPreset(index: number): Promise<any>;
    getFtpCfg(): Promise<any>;
    setFtpCfg(): Promise<boolean>;
    testFtpServer(): Promise<boolean>;
    armStatus(): Promise<boolean>;
    arm(arm: boolean): Promise<boolean>;
}
