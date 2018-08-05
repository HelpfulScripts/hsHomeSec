import { DeviceSettings } from './Device';
import { AbstractCamera } from './Device';
import { Settings } from '../core/Settings';
export declare class Foscam extends AbstractCamera {
    protected path: string;
    constructor(device: DeviceSettings, settings: Settings);
    initDevice(settings: Settings): void;
    snapPicture(): Promise<any>;
    getFtpCfg(): Promise<any>;
    setFtpCfg(): Promise<boolean>;
    testFtpServer(): Promise<boolean>;
    armStatus(): Promise<boolean>;
    arm(arm: boolean): Promise<boolean>;
}
