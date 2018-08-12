"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ftp_srv_1 = require("ftp-srv");
const hsnode_1 = require("hsnode");
const log = new hsnode_1.Log('ftpSrv');
const hsnode_2 = require("hsnode");
const UserComm_1 = require("./UserComm");
const path = require("path");
const settings = {
    host: '0.0.0.0',
    port: 21,
    root: '',
    user: 'one',
    pwd: 'two'
};
function getSettings() {
    return settings;
}
exports.getSettings = getSettings;
function login(data, resolve, reject) {
    data.connection.on('RETR', (error, filePath) => {
        if (error) {
            log.error(`reading '${filePath}': ${error}`);
        }
        else {
            log.warn(`reading '${filePath}'`);
        }
    });
    data.connection.on('STOR', (error, filePath) => {
        if (error) {
            log.error(`writing '${filePath}': ${error}`);
        }
        else {
            log.warn(`motion alarm: writing '${filePath}'`);
            const ext = path.extname(filePath);
            if (ext === 'jpg' || ext === 'png') {
                UserComm_1.message([UserComm_1.users.userByName()], 'alarm', [filePath]);
            }
        }
    });
    log.debug(`ftp login received: resolving for root "${settings.root}"`);
    if (data.username !== settings.user || data.password !== settings.pwd) {
        log.error(`wrong user/pwd: ${data.username}/${data.password}`);
        reject(new Error('nono'));
    }
    log.debug(`login accepted for root "${settings.root}"`);
    resolve({ root: settings.root, cwd: './' });
}
function start(baseDir, s) {
    settings.host = s.host;
    const ftpServer = new ftp_srv_1.FtpSrv(`ftp://${settings.host}:${settings.port}`);
    const root = `${baseDir}/${s.root}`;
    log.debug(`testing ftp server root '${root}'`);
    return hsnode_2.fs.realPath(root)
        .then((p) => {
        settings.root = p;
        log.info(`ftp root ${settings.root}`);
        ftpServer.on('login', login);
        ftpServer.on('client-error', (data) => {
            log.error(`client error received: context ${data.context} \n${log.inspect(data.error)}`);
        });
        return ftpServer.listen();
    })
        .then(() => { log.info(`ftp server started on ${settings.host}:${settings.port}`); })
        .catch((err) => {
        log.error(`creating ftp server on '${settings.host}:${settings.port}:/${settings.root}'`);
        log.error(err);
        ftpServer.close();
    });
}
exports.start = start;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnRwU3J2LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL25vZGUvY29tbS9mdHBTcnYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxxQ0FBbUM7QUFDbkMsbUNBQWtDO0FBQUUsTUFBTSxHQUFHLEdBQUcsSUFBSSxZQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDbEUsbUNBQWtDO0FBQ2xDLHlDQUE2QztBQUM3Qyw2QkFBZ0M7QUFVaEMsTUFBTSxRQUFRLEdBQWU7SUFDekIsSUFBSSxFQUFFLFNBQVM7SUFDZixJQUFJLEVBQUcsRUFBRTtJQUNULElBQUksRUFBRSxFQUFFO0lBQ1IsSUFBSSxFQUFFLEtBQUs7SUFDWCxHQUFHLEVBQUcsS0FBSztDQUNkLENBQUM7QUFFRjtJQUNJLE9BQU8sUUFBUSxDQUFDO0FBQ3BCLENBQUM7QUFGRCxrQ0FFQztBQUVELGVBQWUsSUFBUSxFQUFFLE9BQVcsRUFBRSxNQUFVO0lBQzVDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLEtBQVksRUFBRSxRQUFlLEVBQUUsRUFBRTtRQUN6RCxJQUFJLEtBQUssRUFBRTtZQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsWUFBWSxRQUFRLE1BQU0sS0FBSyxFQUFFLENBQUMsQ0FBQztTQUFFO2FBQ2pEO1lBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLFFBQVEsR0FBRyxDQUFDLENBQUM7U0FBQztJQUNwRCxDQUFDLENBQUMsQ0FBQztJQUNILElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLEtBQVksRUFBRSxRQUFlLEVBQUUsRUFBRTtRQUN6RCxJQUFJLEtBQUssRUFBRTtZQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsWUFBWSxRQUFRLE1BQU0sS0FBSyxFQUFFLENBQUMsQ0FBQztTQUFFO2FBQ3ZEO1lBQ0QsR0FBRyxDQUFDLElBQUksQ0FBQywwQkFBMEIsUUFBUSxHQUFH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