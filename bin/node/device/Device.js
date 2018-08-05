"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
const hsnode_1 = require("hsnode");
const log = new hsnode_1.Log('hsDevice');
const hsnode_2 = require("hsnode");
const hsnode_3 = require("hsnode");
class AbstractDevice {
    hasVideo() { return false; }
    hasAudio() { return false; }
    hasAlarm() { return false; }
    hasMotionAlarm() { return false; }
    constructor(deviceSettings, settings) {
        this.settings = deviceSettings;
        DeviceList.addDevice(this);
    }
    initDevice(settings) { }
    getSettings() {
        return this.settings;
    }
    getName() {
        return this.settings.name;
    }
}
exports.AbstractDevice = AbstractDevice;
class AbstractCamera extends AbstractDevice {
    constructor(device, settings) {
        super(device, settings);
        this.audible = false;
        this.armed = false;
    }
    initDevice(settings) {
        super.initDevice(settings);
        this.setRecordingDir(`${settings.homeSecDir}/${settings.recDir || ''}`);
        this.setFtpCfg();
    }
    hasVideo() { return true; }
    hasAlarm() { return true; }
    isArmed() { return this.armed; }
    setRecordingDir(recDir) {
        return hsnode_3.fs.realPath(recDir).then((p) => {
            this.getSettings().recDir = p;
            log.debug(`${this.getName()} recording directory set to ${this.getSettings().recDir}`);
            return p;
        });
    }
    getRecordingDir() {
        return Promise.resolve(this.getSettings().recDir);
    }
    setAudible(audible) {
        this.audible = (audible === true);
        return log.debug(`${this.getName()} audible: ${this.audible}`)
            .then(() => true);
    }
    getAudible() {
        return this.audible;
    }
    sendCommandToDevice(cmd, dynData) {
        const settings = this.getSettings();
        log.debug(`${this.getName()} requesting ${cmd}`);
        const Url = new url_1.URL(`http://${settings.user}:${settings.passwd}@${settings.host}:${settings.port}${cmd}`);
        const options = {
            host: Url.host,
            hostname: Url.hostname,
            port: Url.port,
            method: 'GET',
            path: Url.pathname + Url.search,
            protocol: Url.protocol,
            headers: { 'User-Agent': 'helpful scripts' },
            username: Url.username,
            password: Url.password
        };
        if (dynData) {
            options.path = dynData.path;
            options.headers.referer = Url.href;
        }
        return hsnode_2.http.get(options)
            .then((r) => {
            log.debug(`${this.getName()} received ${r.response.headers['content-type']} for ${cmd}`);
            if (r.response.headers['content-type'].indexOf('text/') >= 0) {
                r.body = hsnode_2.http.decodeXmlResult(r.data);
            }
            return r;
        })
            .catch(log.error.bind(log));
    }
}
exports.AbstractCamera = AbstractCamera;
class DeviceList {
    static addDevice(device) {
        const settings = device.getSettings();
        if (!settings.name) {
            log.error('device name missing');
        }
        if (!settings.host) {
            log.error('device host missing');
        }
        if (!settings.port) {
            log.error('device port missing');
        }
        DeviceList.list.push(device);
        DeviceList.list[settings.name] = device;
        DeviceList.list[settings.id] = device;
    }
    static getDevice(name) {
        return DeviceList.list[name];
    }
    static getDevices() {
        return this.list.slice(0);
    }
}
DeviceList.list = [];
exports.DeviceList = DeviceList;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGV2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL25vZGUvZGV2aWNlL0RldmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLDZCQUFtQztBQUNuQyxtQ0FBc0M7QUFBRyxNQUFNLEdBQUcsR0FBRyxJQUFJLFlBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUN6RSxtQ0FBc0M7QUFDdEMsbUNBQXNDO0FBaUd0QztJQUdJLFFBQVEsS0FBc0IsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQzdDLFFBQVEsS0FBc0IsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQzdDLFFBQVEsS0FBc0IsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQzdDLGNBQWMsS0FBZ0IsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBRTdDLFlBQVksY0FBOEIsRUFBRSxRQUFpQjtRQUN6RCxJQUFJLENBQUMsUUFBUSxHQUFHLGNBQWMsQ0FBQztRQUMvQixVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFRCxVQUFVLENBQUMsUUFBaUIsSUFBRyxDQUFDO0lBRWhDLFdBQVc7UUFDUCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDekIsQ0FBQztJQUVELE9BQU87UUFDSCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO0lBQzlCLENBQUM7Q0FFSjtBQXZCRCx3Q0F1QkM7QUFFRCxvQkFBcUMsU0FBUSxjQUFjO0lBSXZELFlBQVksTUFBc0IsRUFBRSxRQUFpQjtRQUNqRCxLQUFLLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBSnBCLFlBQU8sR0FBRyxLQUFLLENBQUM7UUFDZCxVQUFLLEdBQUssS0FBSyxDQUFDO0lBSTFCLENBQUM7SUFFRCxVQUFVLENBQUMsUUFBaUI7UUFDeEIsS0FBSyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMzQixJQUFJ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