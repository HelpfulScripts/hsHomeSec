"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
            this.log.debug(`standardSend '${cmd}' result:\n${this.log.inspect(receivedData.body, null)}`);
            if ((typeof receivedData.body === 'string') && (receivedData.body.match(/Success/))) {
                this.log.info(`${name} success`);
                return true;
            }
            else {
                this.log.info(`${name} failure: ${this.log.inspect(receivedData.body, null)}`);
                return false;
            }
        })
            .catch(err => {
            this.log.error('error ' + err);
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
            this.log.debug('get snapshot:' + src);
            return this.sendCommandToDevice(src);
        })
            .catch(this.log.error.bind(this.log));
    }
    getFtpCfg() {
        const cmd = `${this.path}ftp.cgi?cmd=getftpattr`;
        this.log.info(`setting FTP config`);
        return this.sendCommandToDevice(cmd)
            .then((receivedData) => {
            this.log.debug('get ftp config:' + util_1.inspect(receivedData.body));
            const result = {};
            receivedData.body.replace(/var /g, '').replace(/\n/g, '').split(';').map((p) => { p = p.split('='); if (p[1]) {
                result[p[0]] = p[1].replace(/\'/g, '');
            } });
            this.log.info(`ftp config: \n${this.log.inspect(result, null)}`);
            return result;
        })
            .catch(err => {
            this.log.error('error' + err);
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
            this.log.debug('ftp server test1:' + receivedData.url + '\n' + util_1.inspect(receivedData));
            if (receivedData.testResult !== '0') {
                throw new Error('testFtpServer failed: ' + receivedData.testResult);
            }
            return receivedData;
        })
            .then(() => this.sendCommandToDevice(cmd2))
            .then((receivedData) => {
            this.log.debug('ftp server test2:' + receivedData.url + '\n' + util_1.inspect(receivedData));
            if (receivedData.testResult !== '0') {
                throw new Error('testFtpServer failed: ' + receivedData.testResult);
            }
            return receivedData;
        })
            .catch(this.log.error.bind(this.log));
    }
    armStatus() {
        const cmd = `${this.path}cmd=setalarmact&aname=alarmbeep&switch=on&cmd=setalarmbeepattr&audiotime=1`;
        return this.sendCommandToDevice(cmd)
            .then((result) => this.armed = (result.motionDetectAlarm !== '0'))
            .catch(err => {
            this.log.error(err);
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
        if (!this.getSettings().useAlarm) {
            this.armed = false;
            return Promise.resolve(false);
        }
        const cmd = `${this.path}alarm.cgi?${cmds.join('&')}`;
        return this.sendCommandToDevice(cmd)
            .then((result) => this.armed = result)
            .then((result) => {
            const successes = result.data.split('\n');
            let success = successes[0] === 'Success';
            this.log.debug(`individual arm results: (${typeof result.data}) ${this.log.inspect(result.data)}`);
            successes.forEach((s, i) => { if (s && s !== 'Success') {
                this.log.warn(`Command '${cmds[i]}' reported error '${s}'`);
            } });
            this.log.debug(`arm result: ${success ? 'successful' : 'error'}`);
            if (success !== true) {
                this.log.warn(`received data: ${this.log.inspect(result.data, null)}`);
                success = result.data.indexOf('Success') === 0;
                if (success !== true) {
                    this.log.error(`setting motion detect not successful`);
                }
            }
            return success;
        })
            .catch(err => {
            this.log.error(err);
            return this.armStatus();
        });
    }
}
exports.WansView = WansView;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2Fuc1ZpZXcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbm9kZS9kZXZpY2UvV2Fuc1ZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFLQSwrQkFBd0M7QUFJeEMscUNBQTRDO0FBQzVDLHNDQUFrRDtBQUNsRCxtQ0FBMEM7QUFFMUMsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7QUFDM0IsTUFBTSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7QUFFNUIsY0FBc0IsU0FBUSx1QkFBYztJQUd4QyxZQUFZLE1BQXNCLEVBQUUsUUFBaUI7UUFDakQsS0FBSyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUhsQixTQUFJLEdBQUcsRUFBRSxDQUFDO1FBSWhCLElBQUksQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDO0lBRTNCLENBQUM7SUFFRCxVQUFVLENBQUMsUUFBaUI7UUFDeEIsS0FBSyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMzQixJQUFJLENBQUMsY0FBYyxFQUFFO2FBQ3BCLElBQUksQ0FBQyxHQUFFLEVBQUUsQ0FBQSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBRUQsWUFBWSxDQUFDLEdBQVUsRUFBRSxJQUFXO1FBQ2hDLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQzthQUMvQixJQUFJLENBQUMsQ0FBQyxZQUE4QixFQUFFLEVBQUU7WUFDckMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEdBQUcsY0FBYyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUM5RixJQUFJLENBQUMsT0FBTyxZQUFZLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FB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