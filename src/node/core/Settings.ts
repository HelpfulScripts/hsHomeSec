import { DeviceSettings } from '../device/Device';
import { User }           from '../comm/UserComm';
import { FtpSettings }    from '../comm/ftpSrv';

export interface Settings { 
    homeSecDir: string;         // base directory for all home security files
    ftp:        FtpSettings;
    devices:    [DeviceSettings];
    recDir:     string;         // where to store A/V recordings, relative to homeSecDir
    logDir:     string;         // where to store log entries, relative to homeSecDir
    logFile:    string;         // template name for logfiles
    cmdPort:    number;         // http port on which to listen for incoming commands
    users:      User[];         // list of reciptient who may get notifications from the homesec system
    activeRecipient: string;    // who in the list of recipients is the main receiver
    user?:      string;
    passwd?:    string;
}