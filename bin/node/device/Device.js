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
    hasPTZ() { return false; }
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
    ptzPreset(index) { return Promise.resolve(); }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGV2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL25vZGUvZGV2aWNlL0RldmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLDZCQUFtQztBQUNuQyxtQ0FBc0M7QUFBQyxNQUFNLEdBQUcsR0FBRyxJQUFJLFlBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNyRSxtQ0FBc0M7QUFFdEMsbUNBQXNDO0FBeUd0QztJQUlJLFFBQVEsS0FBc0IsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQzdDLFFBQVEsS0FBc0IsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQzdDLFFBQVEsS0FBc0IsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQzdDLGNBQWMsS0FBZ0IsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBRTdDLFlBQVksY0FBOEIsRUFBRSxRQUFpQjtRQUN6RCxJQUFJLENBQUMsUUFBUSxHQUFHLGNBQWMsQ0FBQztRQUMvQixVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNCLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxZQUFHLENBQUMsR0FBRyxjQUFjLENBQUMsSUFBSSxJQUFJLGNBQWMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ3hFLENBQUM7SUFFRCxVQUFVLENBQUMsUUFBaUIsSUFBRyxDQUFDO0lBRWhDLFdBQVc7UUFDUCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDekIsQ0FBQztJQUVELE9BQU87UUFDSCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO0lBQzlCLENBQUM7Q0FFSjtBQXpCRCx3Q0F5QkM7QUFFRCxvQkFBcUMsU0FBUSxjQUFjO0lBSXZELFlBQVksTUFBc0IsRUFBRSxRQUFpQjtRQUNqRCxLQUFLLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBSnBCLFlBQU8sR0FBTyxLQUFLLENBQUM7UUFDbEIsVUFBSyxH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