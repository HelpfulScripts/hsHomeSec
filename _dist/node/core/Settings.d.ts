import { DeviceSettings } from '../device/Device';
import { User } from '../comm/UserComm';
import { FtpSettings } from '../comm/ftpSrv';
export interface Settings {
    homeSecDir: string;
    ftp: FtpSettings;
    devices: [DeviceSettings];
    recDir: string;
    logDir: string;
    logFile: string;
    cmdPort: number;
    users: User[];
    activeRecipient: string;
    user?: string;
    passwd?: string;
}
