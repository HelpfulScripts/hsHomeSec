import * as cmds            from './CommandExecution';
import { CfgSettings }         from './CfgSettings';
import * as user            from '../comm/UserComm';
import { DeviceSettings }   from '../device/Device';
import { DeviceList }       from '../device/Device';
import { AbstractCamera }   from '../device/Device';
import { FtpSettings }      from '../comm/ftpSrv';
import { log, fs }          from 'hsnode';

jest.mock('hsosaes6');

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

export class TestCamera extends AbstractCamera {
    constructor(device: DeviceSettings, settings:CfgSettings) {
        super(device, settings);
        if (device.useAlarm === undefined) { device.useAlarm = true; }
    }
    setTime():Promise<void> { return Promise.resolve(); }
    snapPicture():Promise<any> { return Promise.resolve({data:'1234'}); }
    getFtpCfg():Promise<FtpSettings> { return Promise.resolve({host:'127.0.0.1', root:'./'}); }
    setFtpCfg():Promise<boolean> { return Promise.resolve(true); }
    testFtpServer():Promise<boolean> { return Promise.resolve(true); }
    armStatus():Promise<boolean> { return Promise.resolve(true); }
    arm(arm:boolean):Promise<boolean> { return Promise.resolve(true); }
}

describe('CommandExecution', ()=> {
    // log.level(log.DEBUG, true);
    beforeAll(() => {
        cmds.setSnapshotDir('./');
        settings.devices.map((dev:DeviceSettings) => {
            log.debug(`creating ${dev.name}`);
            new TestCamera(dev, settings);
        });
        settings.users.map(u => user.users.addUser(u));

    });

    test('device list', () => {
        expect(DeviceList.getDevices().length).toBe(2);
        expect(DeviceList.getDevices().map(d => d.getName())).toContain('myWansView');
        expect(DeviceList.getDevices().map(d => d.getName())).toContain('myFoscam');
    });

    describe('helpFn', () => {
        it('should return help', () => 
            expect(cmds.helpFn()).resolves.toEqual({"message": "available commands:\n "})
        );
    });
    describe('restartFn', () => {
        const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
        it('should restart', () => cmds.restartFn().then((res) => {
            expect(mockExit).toHaveBeenCalled();
            expect(res).toEqual(undefined);
        }));
    });
    describe('snapFn', () => {
        it('should return all snapshots', () => {
            expect.assertions(3);
            return cmds.snapFn()
            .then((snaps:{attachments:string[]}) => Promise.all([
                expect(snaps.attachments.length).toBe(2),
                expect(snaps.attachments[0]).toMatch(/myFoscam_.*\.jpg/),
                expect(snaps.attachments[1]).toMatch(/myWansView_.*\.jpg/),
                snaps.attachments.map(s => fs.remove(s).catch(err => log.error(`snapFn all: error removing ${s}: ${err}`)))
            ]));
        });
        it('should return specific snapshots', () => {
            expect.assertions(2);
            return cmds.snapFn(['myWansView'])
            .then((snaps:{attachments:string[]}) => Promise.all([
                expect(snaps.attachments.length).toBe(1),
                expect(snaps.attachments[0]).toMatch(/myWansView_.*\.jpg/),
                snaps.attachments.map(s => fs.remove(s).catch(err => log.error(`snapFn one: error removing ${s}: ${err}`)))
            ]));
        });
    });
    describe('camPreset', () => {
        jest.useFakeTimers();
        it('should preset camera and return snapshot', () => {
            expect.assertions(1);
            const p = cmds.camPreset(['myWansView', '2']).then(snaps => Promise.all([
                expect(snaps.attachments[0]).toMatch(/myWansView_.*\.jpg/),
                // snaps.attachments.map(s => fs.remove(s).catch(err => log.error(`camPreset: error removing ${s}: ${err}`)))
            ]));
            process.nextTick(() =>jest.advanceTimersByTime(10000));
            return p;
        });
    });
    describe('facetimeFn', () => {
        it('should start Facetime call', () => 
            expect(cmds.facetimeFn(['me'])).resolves.toEqual({message:''})
        );
    });
    describe('sayFn', () => {
        it('should speak text', () => 
            expect(cmds.sayFn(['hi there'])).resolves.toEqual({message:''})
        );
    });
    describe('armFn', () => {
        it('should arm all sensors', () => cmds.armFn(['away']).then(res => {
            expect(res.message).toMatch(/myFoscam armed with siren/);
            expect(res.message).toMatch(/myWansView armed with siren/);
        }));
    });
    describe('disarmFn', () => {
        it('should disarm all sensors', () => cmds.disarmFn().then(res => {
            expect(res.message).toMatch(/myFoscam disarmed/);
            expect(res.message).toMatch(/myWansView disarmed/);
        }));
    });
    describe('armingStatusFn', () => {
        it('should return all armed statuses', () => cmds.armingStatusFn().then(res => {
            expect(res.message.length).toBe(2);
            expect(res.message[0]).toHaveProperty('myFoscam');
            expect(res.message[0].myFoscam).toBe(false);
            expect(res.message[1]).toHaveProperty('myWansView');
            expect(res.message[1].myWansView).toBe(false);
        }));
    });
    describe('lightFn', () => {
        it('should turn on light', () => 
            expect(cmds.lightFn(['on'])).resolves.toEqual({message:false})  // currently disabled in source
        );
        it('should turn off light', () => 
            expect(cmds.lightFn(['off'])).resolves.toEqual({message:false})
        );
    });
});