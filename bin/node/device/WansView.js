"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hsnode_1 = require("hsnode");
const log = new hsnode_1.Log('WansView');
const util_1 = require("util");
const Device_1 = require("./Device");
const ftp = require("../comm/ftpSrv");
const hsutil_1 = require("hsutil");
const audioSensitivity = 5;
const videoSensitivity = 95;
class WansView extends Device_1.AbstractCamera {
    constructor(device, settings) {
        super(device, settings);
        this.path = '';
        log.prefix(`WansView ${device.name}`);
        this.path = `/hy-cgi/`;
    }
    initDevice(settings) {
        super.initDevice(settings);
        this.setOverlayText()
            .then(() => this.setTime());
    }
    standardSend(cmd, name) {
        return this.sendCommandToDevice(cmd)
            .then((receivedData) => {
            const success = receivedData.body.trim() === 'Success';
            log.info(`${name} ${success ? 'success' : 'failure'}`);
            return true;
        })
            .catch(err => {
            log.error('error' + err);
            return false;
        });
    }
    setTime() {
        const cmd = `${this.path}device.cgi?cmd=setsystime&stime=${hsutil_1.date('%YYYY-%MM-%DD;%hh:%mm:%ss')}&timezone=6`;
        return this.standardSend(cmd, 'setTime');
    }
    setOverlayText() {
        const cmd = `${this.path}av.cgi?cmd=setosdattr&region=0&show=1&cmd=setosdattr&region=1&show=1&name=${this.getName()}`;
        return this.standardSend(cmd, 'setOverlayText');
    }
    snapPicture() {
        const cmd = `${this.path}av.cgi?cmd=manualsnap&chn=0`;
        return this.sendCommandToDevice(cmd)
            .then((res) => {
            const path = res.body.toString().split('=');
            const src = path[1].replace(';', '').trim();
            log.debug('get snapshot:' + src);
            const dyn = { path: src };
            return this.sendCommandToDevice(cmd, dyn);
        })
            .catch(log.error.bind(log));
    }
    getFtpCfg() {
        const cmd = `${this.path}ftp.cgi?cmd=getftpattr`;
        return this.sendCommandToDevice(cmd)
            .then((receivedData) => {
            log.debug('get ftp config:' + util_1.inspect(receivedData.body));
            const result = {};
            receivedData.body.replace(/var /g, '').replace(/\n/g, '').split(';').map((p) => { p = p.split('='); if (p[1]) {
                result[p[0]] = p[1].replace(/\'/g, '');
            } });
            log.info(`ftp config: \n${log.inspect(result, null)}`);
            return result;
        })
            .catch(err => {
            log.error('error' + err);
        });
    }
    setFtpCfg() {
        const ftpSettings = ftp.getSettings();
        const cmd = `${this.path}ftp.cgi?cmd=setftpattr&ft_server=${ftpSettings.host}&ft_port=${ftpSettings.port}&ft_username=${ftpSettings.user}&ft_password=${ftpSettings.pwd}&ft_dirname=./`;
        return this.standardSend(cmd, 'setFtpCfg');
    }
    testFtpServer() {
        const cmd1 = `${this.path}ftp.cgi?cmd=testftp`;
        const cmd2 = `${this.path}ftp.cgi?cmd=testftpresult`;
        return this.sendCommandToDevice(cmd1)
            .then((receivedData) => {
            log.debug('ftp server test1:' + receivedData.url + '\n' + util_1.inspect(receivedData));
            if (receivedData.testResult !== '0') {
                throw new Error('testFtpServer failed: ' + receivedData.testResult);
            }
            return receivedData;
        })
            .then(() => this.sendCommandToDevice(cmd2))
            .then((receivedData) => {
            log.debug('ftp server test2:' + receivedData.url + '\n' + util_1.inspect(receivedData));
            if (receivedData.testResult !== '0') {
                throw new Error('testFtpServer failed: ' + receivedData.testResult);
            }
            return receivedData;
        })
            .catch(log.error.bind(log));
    }
    armStatus() {
        const cmd = `${this.path}cmd=setalarmact&aname=alarmbeep&switch=on&cmd=setalarmbeepattr&audiotime=1`;
        return this.sendCommandToDevice(cmd)
            .then((result) => this.armed = (result.motionDetectAlarm !== '0'))
            .catch(err => {
            log.error(err);
            throw err;
        });
    }
    arm(arm) {
        const audio = this.getAudible();
        const cmds = [
            `cmd=setmdattr&enable=${arm ? 1 : 0}&sensitivity=${videoSensitivity}&left=0&top=0&right=1920&bottom=1080&index=0&name=MD0`,
            `cmd=setaudioalarmattr&aa_enable=${arm ? 1 : 0}&aa_value=${audioSensitivity}`,
            `cmd=setalarmact&aname=alarmbeep&switch=${audio ? 'on' : 'off'}`,
            `cmd=setalarmbeepattr&audiotime=5`,
            `cmd=setalarmact&aname=emailsnap&switch=off`,
            `cmd=setalarmact&aname=snap&switch=off`,
            `cmd=setalarmact&aname=record&switch=off`,
            `cmd=setalarmact&aname=ftpsnap&switch=on`,
            `cmd=setalarmact&aname=ftprec&switch=on`,
            `cmd=setalarmact&aname=preset&switch=off`,
            `cmd=setrelayattr&time=5&cmd=setalarmact&aname=relay&switch=off`,
            `cmd=setmotorattr&alarmpresetindex=1`,
            `cmd=setalarmact&aname=type&switch=off`
        ];
        const cmd = `${this.path}alarm.cgi?${cmds.join('&')}`;
        return this.sendCommandToDevice(cmd)
            .then((result) => this.armed = result)
            .then((result) => {
            const successes = result.data.split('\n');
            let success = successes[0] === 'Success';
            log.debug(`individual arm results: (${typeof result.data}) ${log.inspect(result.data)}`);
            successes.forEach((s, i) => { if (s && s !== 'Success') {
                log.warn(`Command '${cmds[i]}' reported error '${s}'`);
            } });
            log.debug(`arm result: ${success ? 'successful' : 'error'}`);
            if (success !== true) {
                log.warn(`received data: ${log.inspect(result.data, null)}`);
                success = result.data.indexOf('Success') === 0;
                if (success !== true) {
                    log.error(`setting motion detect not successful`);
                }
            }
            return success;
        })
            .catch(err => {
            log.error(err);
            return this.armStatus();
        });
    }
}
exports.WansView = WansView;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2Fuc1ZpZXcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbm9kZS9kZXZpY2UvV2Fuc1ZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFHQSxtQ0FBMEM7QUFBRSxNQUFNLEdBQUcsR0FBRyxJQUFJLFlBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUc1RSwrQkFBd0M7QUFJeEMscUNBQTRDO0FBQzVDLHNDQUFrRDtBQUNsRCxtQ0FBMEM7QUFHMUMsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7QUFDM0IsTUFBTSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7QUFFNUIsY0FBc0IsU0FBUSx1QkFBYztJQUd4QyxZQUFZLE1BQXNCLEVBQUUsUUFBaUI7UUFDakQsS0FBSyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUhsQixTQUFJLEdBQUcsRUFBRSxDQUFDO1FBSWhCLEdBQUcsQ0FBQyxNQUFNLENBQUMsWUFBWSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUN0QyxJQUFJLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQztJQUUzQixDQUFDO0lBRUQsVUFBVSxDQUFDLFFBQWlCO1FBQ3hCLEtBQUssQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDM0IsSUFBSSxDQUFDLGNBQWMsRUFBRTthQUNwQixJQUFJLENBQUMsR0FBRSxFQUFFLENBQUEsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVELFlBQVksQ0FBQyxHQUFVLEVBQUUsSUFBVztRQUNoQyxPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUM7YUFDL0IsSUFBSSxDQUFDLENBQUMsWUFBOEIsRUFBRSxFQUFFO1lBQ3JDLE1BQU0sT0FBTyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssU0FBUyxDQUFDO1lBQ3ZELEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxJ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