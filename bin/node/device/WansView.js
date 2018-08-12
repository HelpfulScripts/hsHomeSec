"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const Device_1 = require("./Device");
const ftp = require("../comm/ftpSrv");
const hsutil_1 = require("hsutil");
const audioSensitivity = 5;
const videoSensitivity = 95;
const commands = {
    alarm: { cgi: 'alarm.cgi?', cmds: (arm, audio) => [
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
        ].join('&') },
    status: { cgi: 'status.cgi?', cmds: [
            `cmd=getdevstatus`,
        ] },
    net: { cgi: 'net.cgi?', cmds: [
            `cmd=getmacaddr`,
        ] },
    user: { cgi: 'user.cgi?', cmds: [
            `cmd=checkuserinfo&ck_password=0`,
        ] },
    ptz: { cgi: 'ptz.cgi?', cmds: [
            `cmd=getmotorattr`,
            `cmd=getptztour`,
            `cmd=getrealtimeptzpos`,
            `cmd=preset&act=goto&number=`,
        ] },
    device: { cgi: 'device.cgi?', cmds: [
            `cmd=setlightattr&statuslight=on&wifilight=on`,
            `cmd=getlightattr`,
        ] }
};
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
        const cmd = `${this.path}device.cgi?cmd=setsystime&stime=${hsutil_1.date('%YYYY-%MM-%DD;%hh:%mm:%ss')}&timezone=7`;
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
    ptzPreset(index) {
        const cmd = `${this.path}${commands.ptz.cgi}${commands.ptz.cmds[3]}${index}`;
        return this.sendCommandToDevice(cmd);
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
        if (!this.getSettings().useAlarm) {
            this.armed = false;
            return Promise.resolve(false);
        }
        const cmd = `${this.path}${commands.alarm.cgi}${commands.alarm.cmds(arm, audio)}`;
        return this.sendCommandToDevice(cmd)
            .then((result) => this.armed = result)
            .then((result) => {
            const successes = result.data.split('\n');
            let success = successes[0] === 'Success';
            this.log.debug(`individual arm results: (${typeof result.data}) ${this.log.inspect(result.data)}`);
            successes.forEach((s, i) => { if (s && s !== 'Success') {
                this.log.warn(`Command '${commands.alarm.cmds[i]}' reported error '${s}'`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2Fuc1ZpZXcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbm9kZS9kZXZpY2UvV2Fuc1ZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFLQSwrQkFBd0M7QUFJeEMscUNBQTRDO0FBQzVDLHNDQUFrRDtBQUNsRCxtQ0FBMEM7QUFFMUMsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7QUFDM0IsTUFBTSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7QUFFNUIsTUFBTSxRQUFRLEdBQUc7SUFDYixLQUFLLEVBQUUsRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxDQUFDLEdBQVcsRUFBRSxLQUFhLEVBQUMsRUFBRSxDQUFBO1lBQzFDLHdCQUF3QixHQUFHLENBQUEsQ0FBQyxDQUFBLENBQUMsQ0FBQSxDQUFDLENBQUEsQ0FBQyxnQkFBZ0IsZ0JBQWdCLHVEQUF1RDtZQUN0SCxtQ0FBbUMsR0FBRyxDQUFBLENBQUMsQ0FBQSxDQUFDLENBQUEsQ0FBQyxDQUFBLENBQUMsYUFBYSxnQkFBZ0IsRUFBRTtZQUN6RSwwQ0FBMEMsS0FBSyxDQUFBLENBQUMsQ0FBQSxJQUFJLENBQUEsQ0FBQyxDQUFBLEtBQUssRUFBRTtZQUM1RCxrQ0FBa0M7WUFDbEMsNENBQTRDO1lBQzVDLHVDQUF1QztZQUN2Qyx5Q0FBeUM7WUFDekMseUNBQXlDO1lBQ3pDLHdDQUF3QztZQUN4Qyx5Q0FBeUM7WUFDekMsZ0VBQWdFO1lBQ2hFLHFDQUFxQztZQUNyQyx1Q0FBdUM7U0FDNUQsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUM7SUFDWixNQUFNLEVBQUUsRUFBRSxHQUFHLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRTtZQUNkLGtCQUFrQjtTQUN2QyxFQUFDO0lBQ0YsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUU7WUFDUixnQkFBZ0I7U0FDckMsRUFBQztJQUNGLElBQUksRUFBRSxFQUFFLEdB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