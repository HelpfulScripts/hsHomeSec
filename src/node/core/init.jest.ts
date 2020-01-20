import { CfgSettings }          from './CfgSettings';
import * as init                from './Init';
import { http }                 from 'hsnode'; if(http) {}
// import { DeviceSettings }       from '../device/Device';
import { DeviceList }           from '../device/Device';
// import { Device }               from '../device/Device';
import { users }                from '../comm/UserComm';
import * as Comm                from './CommandReceiver';


const settings:CfgSettings = {
    "homeSecDir":   "./hshomesec/",
    "alarmText": "Stop!",
    "ftp": {
        "host": "10.0.0.1", 
        "root": "recordings/"
    },
    "devices":  [
        {
            "id": "1",          // resolves to a number, hence 'dev_' will be prepended
            "name": "myFoscam", 
            "type": "foscam",
            "host": "10.0.0.2", 
            "port": 88,
            "user": "hs",
            "passwd": "helpfulscripts"
        },
        {
            "id": "_2",         // used as is, nothing prepended
            "name": "myWansView", 
            "type": "wansview",
            "host": "10.0.0.3", 
            "port": 80,
            "user": "hs",
            "passwd": "helpfulscripts",
            "useAlarm":false
        }
    ],
    "recDir":   "recordings/",
    "logDir":   "log/",
    "logFile":  "hsLog_%YYYY%MM%DD.log",
    "cmdPort":  573,
    "users": [
        {   "name": "me",  
            "email": ["me@test.com"],
            "AppleID": "meID" 
        }
    ],
    "activeRecipient": "me"
};

jest.mock('http'); 

beforeEach(() => {
});
  
describe('init', () => {
    beforeAll(()=>init.startSecuritySystem(settings));
    test('commands should be defined', () => {
        expect(Comm.getCommands().length).toBe(init.cmdList.length);
    });
    test('devices should be defined', () => {
        expect(DeviceList.getDevices().length).toBe(2);
    });
    test('users should be defined', () => {
        expect(users.getUserNames().length).toBe(1);
        expect(users.userByName('me').email[0]).toBe("me@test.com");
    });
});