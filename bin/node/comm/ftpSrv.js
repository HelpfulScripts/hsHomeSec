"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ftp_srv_1 = require("ftp-srv");
const hsnode_1 = require("hsnode");
const log = new hsnode_1.Log('ftp');
const hsnode_2 = require("hsnode");
const UserComm_1 = require("./UserComm");
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
            log.warn(`writing '${filePath}'`);
            UserComm_1.message(UserComm_1.users[0], 'snapshot', [filePath]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnRwU3J2LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL25vZGUvY29tbS9mdHBTcnYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxxQ0FBbUM7QUFDbkMsbUNBQWtDO0FBQUUsTUFBTSxHQUFHLEdBQUcsSUFBSSxZQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDL0QsbUNBQWtDO0FBQ2xDLHlDQUE2QztBQVU3QyxNQUFNLFFBQVEsR0FBZTtJQUN6QixJQUFJLEVBQUUsU0FBUztJQUNmLElBQUksRUFBRyxFQUFFO0lBQ1QsSUFBSSxFQUFFLEVBQUU7SUFDUixJQUFJLEVBQUUsS0FBSztJQUNYLEdBQUcsRUFBRyxLQUFLO0NBQ2QsQ0FBQztBQUVGO0lBQ0ksT0FBTyxRQUFRLENBQUM7QUFDcEIsQ0FBQztBQUZELGtDQUVDO0FBRUQsZUFBZSxJQUFRLEVBQUUsT0FBVyxFQUFFLE1BQVU7SUFDNUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsS0FBWSxFQUFFLFFBQWUsRUFBRSxFQUFFO1FBQzdELElBQUksS0FBSyxFQUFFO1lBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxZQUFZLFFBQVEsTUFBTSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1NBQUU7YUFDakQ7WUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksUUFBUSxHQUFHLENBQUMsQ0FBQztTQUFDO0lBQ2hELENBQUMsQ0FBQyxDQUFDO0lBQ0gsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsS0FBWSxFQUFFLFFBQWUsRUFBRSxFQUFFO1FBQzdELElBQUksS0FBSyxFQUFFO1lBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxZQUFZLFFBQVEsTUFBTSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1NBQUU7YUFDbkQ7WUFDRCxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksUUFBUSxHQUFHLENBQUMsQ0FBQztZQUNs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