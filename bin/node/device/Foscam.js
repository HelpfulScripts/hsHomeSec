"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
            let src = res.body.html.body.img.attrs.src;
            if (src.indexOf('../') === 0) {
                src = src.substr(2);
            }
            this.log.debug(`get snapshot: ${src}`);
            return this.sendCommandToDevice(src);
        })
            .catch(this.log.error.bind(this.log));
    }
    getFtpCfg() {
        const cmd = `${this.path}getFtpConfig`;
        return this.sendCommandToDevice(cmd)
            .then((res) => {
            const result = res.body.CGI_Result;
            if (result.result === '0') {
                result.ftpAddr = unescape(result.ftpAddr);
                this.log.info(`ftp config = \n${this.log.inspect(result)}`);
                return result;
            }
            else {
                this.log.error(`ftp config result=${result.result}: \n${this.log.inspect(result)}`);
                return result;
            }
        })
            .catch(this.log.error.bind(this.log));
    }
    setFtpCfg() {
        const ftpSettings = ftp.getSettings();
        const cmd = `${this.path}setFtpConfig&ftpAddr=ftp://${ftpSettings.host}/&ftpPort=${ftpSettings.port}&mode=0&userName=${ftpSettings.user}&password=${ftpSettings.pwd}`;
        this.log.info(`setting FTP config`);
        return this.sendCommandToDevice(cmd)
            .then((res) => {
            const success = res.body.CGI_Result.result === '0';
            this.log.info(`setFtpCfg ${success ? 'success' : 'failure'}`);
            this.log.debug(`res: ${this.log.inspect(res.body, null)}`);
            return success;
        })
            .catch(err => {
            this.log.error(err);
            return false;
        });
    }
    testFtpServer() {
        const ftpSettings = ftp.getSettings();
        const cmd = `${this.path}testFtpServer&ftpAddr=ftp://${ftpSettings.host}/&ftpPort=${ftpSettings.port}&mode=0&userName=${ftpSettings.user}&password=${ftpSettings.pwd}`;
        return this.sendCommandToDevice(cmd)
            .then((res) => {
            const result = res.body.testResult === '0';
            this.log[result ? 'info' : 'error'](`ftp server test ${result ? 'succeeded' : 'failed'}`);
            return result;
        })
            .catch(this.log.error.bind(this.log));
    }
    armStatus() {
        const cmd = `${this.path}getDevState`;
        return this.sendCommandToDevice(cmd)
            .then((result) => this.armed = (result.body.motionDetectAlarm !== '0'))
            .catch(err => {
            this.log.error(err);
            throw err;
        });
    }
    arm(arm) {
        if (!this.getSettings().useAlarm) {
            this.armed = false;
            return Promise.resolve(false);
        }
        const link = linkage.pic + linkage.video + (this.getAudible() ? linkage.audio : 0);
        const cmd = `${this.path}${armCmd}&isEnable=${arm ? 1 : 0}&linkage=${link}&sensitivity=${sensitivity}&snapInterval=${snapInterval}&triggerInterval=5`;
        return this.sendCommandToDevice(cmd)
            .then((res) => {
            const success = res.body.CGI_Result.result === '0';
            this.log.debug(`arm result: ${success ? 'successful' : 'error'}`);
            if (!success) {
                this.log.error(`received data: ${this.log.inspect(res.data, null)}`);
            }
            return this.armed = success;
        })
            .catch(err => {
            this.log.error(err);
            return this.armStatus();
        });
    }
}
exports.Foscam = Foscam;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRm9zY2FtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL25vZGUvZGV2aWNlL0Zvc2NhbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQU9BLHFDQUE0QztBQUU1QyxzQ0FBa0Q7QUFFbEQsSUFBTSxNQUFNLEdBQVMsRUFBRSxDQUFDO0FBQ3hCLE1BQU0sWUFBWSxHQUFHLENBQUMsQ0FBQztBQUN2QixNQUFNLFdBQVcsR0FBSSxHQUFHLENBQUM7QUFFekIsTUFBTSxPQUFPLEdBQUc7SUFDWixLQUFLLEVBQUcsQ0FBQztJQUNULElBQUksRUFBSSxDQUFDO0lBQ1QsR0FBRyxFQUFLLENBQUM7SUFDVCxLQUFLLEVBQUcsQ0FBQztDQUNaLENBQUM7QUFJRixZQUFvQixTQUFRLHVCQUFjO0lBR3RDLFlBQVksTUFBc0IsRUFBRSxRQUFpQjtRQUNqRCxLQUFLLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBSGxCLFNBQUksR0FBRyxFQUFFLENBQUM7UUFLaEIsSUFBSSxDQUFDLElBQUksR0FBRyw4QkFBOEIsTUFBTSxDQUFDLElBQUksUUFBUSxNQUFNLENBQUMsTUFBTSxPQUFPLENBQUM7UUFDbEYsSUFBSSxRQUFRLEdBQU0sRUFBRSxDQUFDO1FBQ3JCLElBQUksSUFBSSxHQUFVLEVBQUUsQ0FBQztRQUNyQixLQUFLLElBQUksQ0FBQyxHQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFHO1lBQUUsUUFBUSxHQUFHLFFBQVEsR0FBRyxXQUFXLEdBQUcsQ0FBQyxHQUFHLGtCQUFrQixDQUFDO1NBQUU7UUFDeEYsS0FBSyxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUFFLElBQUksR0FBRyxJQUFJLEdBQUcsT0FBTyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUM7U0FBRTtRQUNqRSxNQUFNLEdBQUcsd0JBQXdCLFFBQVEs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