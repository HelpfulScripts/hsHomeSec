"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hsnode_1 = require("hsnode");
const log = new hsnode_1.Log('Foscam');
const Device_1 = require("./Device");
const ftp = require("../comm/ftpSrv");
let armCmd = '';
const snapInterval = 1;
const sensitivity = '1';
const linkage = {
    audio: 1,
    mail: 2,
    pic: 4,
    video: 8
};
class Foscam extends Device_1.AbstractCamera {
    constructor(device, settings) {
        super(device, settings);
        this.path = '';
        log.prefix(`Foscam ${device.name}`);
        this.path = `/cgi-bin/CGIProxy.fcgi?usr=${device.user}&pwd=${device.passwd}&cmd=`;
        let schedule = '';
        let area = '';
        for (let i = 0; i < 7; i++) {
            schedule = schedule + '&schedule' + i + '=281474976710655';
        }
        for (let i = 0; i < 10; i++) {
            area = area + '&area' + i + '=1023';
        }
        armCmd = `setMotionDetectConfig${schedule}${area}`;
    }
    initDevice(settings) {
        super.initDevice(settings);
    }
    snapPicture() {
        const cmd = `${this.path}snapPicture`;
        return this.sendCommandToDevice(cmd)
            .then((res) => {
            const src = res.body.html.body.img.attrs.src;
            log.debug(`get snapshot: ${src}`);
            const dyn = { path: src };
            return this.sendCommandToDevice(cmd, dyn);
        })
            .catch(log.error.bind(log));
    }
    getFtpCfg() {
        const cmd = `${this.path}getFtpConfig`;
        return this.sendCommandToDevice(cmd)
            .then((res) => {
            const result = res.body.CGI_Result;
            if (result.result === '0') {
                result.ftpAddr = unescape(result.ftpAddr);
                log.info(`ftp config = \n${log.inspect(result)}`);
                return result;
            }
            else {
                log.error(`ftp config result=${result.result}: \n${log.inspect(result)}`);
                return result;
            }
        })
            .catch(log.error.bind(log));
    }
    setFtpCfg() {
        const ftpSettings = ftp.getSettings();
        const cmd = `${this.path}setFtpConfig&ftpAddr=ftp://${ftpSettings.host}/&ftpPort=${ftpSettings.port}&mode=0&userName=${ftpSettings.user}&password=${ftpSettings.pwd}`;
        return this.sendCommandToDevice(cmd)
            .then((res) => {
            const success = res.body.CGI_Result.result === '0';
            log.info(`setFtpCfg ${success ? 'success' : 'failure'}`);
            log.debug(`res: ${log.inspect(res.body, null)}`);
            return success;
        })
            .catch(err => {
            log.error(err);
            return false;
        });
    }
    testFtpServer() {
        const ftpSettings = ftp.getSettings();
        const cmd = `${this.path}testFtpServer&ftpAddr=ftp://${ftpSettings.host}/&ftpPort=${ftpSettings.port}&mode=0&userName=${ftpSettings.user}&password=${ftpSettings.pwd}`;
        return this.sendCommandToDevice(cmd)
            .then((res) => {
            const result = res.body.testResult === '0';
            log[result ? 'info' : 'error'](`ftp server test ${result ? 'succeeded' : 'failed'}`);
            return result;
        })
            .catch(log.error.bind(log));
    }
    armStatus() {
        const cmd = `${this.path}getDevState`;
        return this.sendCommandToDevice(cmd)
            .then((result) => this.armed = (result.body.motionDetectAlarm !== '0'))
            .catch(err => {
            log.error(err);
            throw err;
        });
    }
    arm(arm) {
        const link = linkage.pic + linkage.video + (this.getAudible() ? linkage.audio : 0);
        const cmd = `${this.path}${armCmd}&isEnable=${arm ? 1 : 0}&linkage=${link}&sensitivity=${sensitivity}&snapInterval=${snapInterval}&triggerInterval=5`;
        return this.sendCommandToDevice(cmd)
            .then((res) => {
            const success = res.body.CGI_Result.result === '0';
            log.debug(`arm result: ${success ? 'successful' : 'error'}`);
            if (!success) {
                log.error(`received data: ${log.inspect(res.data, null)}`);
            }
            return this.armed = success;
        })
            .catch(err => {
            log.error(err);
            return this.armStatus();
        });
    }
}
exports.Foscam = Foscam;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRm9zY2FtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL25vZGUvZGV2aWNlL0Zvc2NhbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQU1BLG1DQUEwQztBQUFHLE1BQU0sR0FBRyxHQUFHLElBQUksWUFBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBRTNFLHFDQUE0QztBQUU1QyxzQ0FBa0Q7QUFFbEQsSUFBTSxNQUFNLEdBQVMsRUFBRSxDQUFDO0FBQ3hCLE1BQU0sWUFBWSxHQUFHLENBQUMsQ0FBQztBQUN2QixNQUFNLFdBQVcsR0FBSSxHQUFHLENBQUM7QUFFekIsTUFBTSxPQUFPLEdBQUc7SUFDWixLQUFLLEVBQUcsQ0FBQztJQUNULElBQUksRUFBSSxDQUFDO0lBQ1QsR0FBRyxFQUFLLENBQUM7SUFDVCxLQUFLLEVBQUcsQ0FBQztDQUNaLENBQUM7QUFJRixZQUFvQixTQUFRLHVCQUFjO0lBR3RDLFlBQVksTUFBc0IsRUFBRSxRQUFpQjtRQUNqRCxLQUFLLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBSGxCLFNBQUksR0FBRyxFQUFFLENBQUM7UUFJaEIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxVQUFVLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxJQUFJLEdBQUcsOEJBQThCLE1BQU0sQ0FBQyxJQUFJLFFBQVEsTUFBTSxDQUFDLE1BQU0sT0FBTyxDQUFDO1FBQ2xGLElBQUksUUFBUSxHQUFNLEVBQUUsQ0FBQztRQUNyQixJQUFJLElBQUksR0FBVSxFQUFFLENBQUM7UUFDckIsS0FBSyxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRztZQUFFLFFBQVEsR0FBRyxRQUFRLEdBQUcsV0FBVyxHQUFHLENBQUMsR0FBRyxrQkFBa0IsQ0FBQztTQUFFO1FBQ3hGLEtBQUssSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFF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