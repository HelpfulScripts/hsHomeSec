"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
const hsnode_1 = require("hsnode");
const log = new hsnode_1.Log('Device');
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
        this.log = new hsnode_1.Log(`${deviceSettings.type} ${deviceSettings.name}`);
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
        if (device.useAlarm === undefined) {
            device.useAlarm = true;
        }
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
            this.log.debug(`${this.getName()} recording directory set to ${this.getSettings().recDir}`);
            return p;
        });
    }
    getRecordingDir() {
        return Promise.resolve(this.getSettings().recDir);
    }
    setAudible(audible) {
        this.audible = (audible === true);
        return this.log.debug(`${this.getName()} audible: ${this.audible}`)
            .then(() => true);
    }
    getAudible() {
        return this.audible;
    }
    sendCommandToDevice(cmd, referer) {
        const settings = this.getSettings();
        const Url = new url_1.URL(`http://${settings.host}:${settings.port}${cmd}`);
        this.log.debug(`${this.getName()} requesting ${Url.href}`);
        return hsnode_2.http.request(Url, new hsnode_2.http.Digest(settings.user, settings.passwd), referer)
            .then((r) => {
            this.log.debug(`${this.getName()} received ${r.response.headers['content-type']} for ${cmd}`);
            if (r.response.headers['content-type'].indexOf('text/') >= 0) {
                r.body = hsnode_2.http.xml2json(r.data);
                this.log.debug(`response: ${this.log.inspect(r.body, null)}`);
            }
            return r;
        })
            .catch(this.log.error.bind(this.log));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGV2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL25vZGUvZGV2aWNlL0RldmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLDZCQUFtQztBQUNuQyxtQ0FBc0M7QUFBQyxNQUFNLEdBQUcsR0FBRyxJQUFJLFlBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNyRSxtQ0FBc0M7QUFFdEMsbUNBQXNDO0FBa0d0QztJQUlJLFFBQVEsS0FBc0IsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQzdDLFFBQVEsS0FBc0IsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQzdDLFFBQVEsS0FBc0IsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQzdDLGNBQWMsS0FBZ0IsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBRTdDLFlBQVksY0FBOEIsRUFBRSxRQUFpQjtRQUN6RCxJQUFJLENBQUMsUUFBUSxHQUFHLGNBQWMsQ0FBQztRQUMvQixVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNCLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxZQUFHLENBQUMsR0FBRyxjQUFjLENBQUMsSUFBSSxJQUFJLGNBQWMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ3hFLENBQUM7SUFFRCxVQUFVLENBQUMsUUFBaUIsSUFBRyxDQUFDO0lBRWhDLFdBQVc7UUFDUCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDekIsQ0FBQztJQUVELE9BQU87UUFDSCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO0lBQzlCLENBQUM7Q0FFSjtBQXpCRCx3Q0F5QkM7QUFFRCxvQkFBcUMsU0FBUSxjQUFjO0lBSXZELFlBQVksTUFBc0IsRUFBRSxRQUFpQjtRQUNqRCxLQUFLLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBSnBCLFlBQU8sR0FBTyxLQUFLLENBQUM7UUFDbEIsVUFBSyxH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