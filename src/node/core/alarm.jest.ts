import * as al from './alarm';
import { CfgSettings }     from './CfgSettings';

const settings:CfgSettings = {
    "homeSecDir":   "./hshomesec/",
    "alarmText": "Stop!",
    "ftp": {
        "host": "10.0.0.1", 
        "root": "recordings/"
    },
    "devices":  [],
    "recDir":   "recordings/",
    "logDir":   "log/",
    "logFile":  "hsLog_%YYYY%MM%DD.log",
    "cmdPort":  573,
    "users": [],
    "activeRecipient": "me"
};
describe('alarm', () => {
    test('setAlarmText', () => {
        expect(al.setAlarmText(settings).cmdPort).toBe(573);
    });
});