"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hsnode_1 = require("hsnode");
const log = new hsnode_1.Log('hsMain');
const hsnode_2 = require("hsnode");
const init = require("./Init");
const ftp = require("../comm/ftpSrv");
const httpSrv = require("../comm/httpSrv");
const cliParams = {
    ftpServer: false
};
function cli(args) {
    args.forEach((arg) => {
        const cmd = arg.split('=');
        if (cmd[0] === 'debug') {
            log.level(log.DEBUG);
        }
        if (cmd[0] === 'info') {
            log.level(log.INFO);
        }
        if (cmd[0] === 'warning') {
            log.level(log.WARN);
        }
        if (cmd[0] === 'ftp') {
            cliParams.ftpServer = true;
        }
    });
    return Promise.resolve();
}
function ftpInit(settings) {
    if (cliParams.ftpServer) {
        ftp.start(settings.homeSecDir, settings.ftp);
    }
    return settings;
}
function httpInit(settings) {
    httpSrv.start();
    return settings;
}
try {
    log.debug('Starting Home Security System');
    log.level(log.INFO);
    cli(process.argv)
        .then(() => hsnode_2.fs.readJsonFile(__dirname + '/../../config/homeCfg.json'))
        .then(ftpInit)
        .then(httpInit)
        .then(init.startSecuritySystem)
        .then(init.initDevices)
        .catch(log.error.bind(log));
    process.on('exit', (code) => {
        log.info(`About to exit with code: ${code}`);
        httpSrv.stop();
    });
}
catch (err) {
    log.error(err);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9tZVNlY01haW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbm9kZS9jb3JlL2hvbWVTZWNNYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBVUEsbUNBQWtDO0FBQUcsTUFBTSxHQUFHLEdBQUcsSUFBSSxZQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDbkUsbUNBQWtDO0FBQ2xDLCtCQUFrQztBQUVsQyxzQ0FBMEM7QUFDMUMsMkNBQTJDO0FBRTNDLE1BQU0sU0FBUyxHQUFHO0lBQ2QsU0FBUyxFQUFFLEtBQUs7Q0FDbkIsQ0FBQztBQU1GLGFBQWEsSUFBYTtJQUN0QixJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBVSxFQUFFLEVBQUU7UUFDeEIsTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMzQixJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxPQUFPLEVBQUs7WUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUFFO1FBQ3BELElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLE1BQU0sRUFBTTtZQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQUU7UUFDbkQsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxFQUFHO1lBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7U0FBRTtRQUNuRCxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLEVBQU87WUFBRSxTQUFTLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztTQUFFO0lBQzlELENBQUMsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDN0IsQ0FBQztBQUVELGlCQUFpQixRQUFrQjtJQUMvQixJQUFJLFNBQVMsQ0FBQyxTQUFTLEVBQUU7UUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQUU7SUFDMUUsT0FBTyxRQUFRLENBQUM7QUFDcEIsQ0FBQztBQUVELGtCQUFrQixRQUFrQjtJQUNoQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDaEIsT0FBTyxRQUFRLENBQUM7QUFDcEIsQ0FBQztBQUVELElBQUk7SUFDQSxHQUFHLENBQUMsS0FBSyxDQUFDLCtCQUErQixDQUFDLENBQUM7SUFDM0MsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDcEIsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7U0FDaEIsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLFdBQUUsQ0FBQyxZQUFZLENBQUMsU0FBUyxHQUFDLDRCQUE0QixDQUFDLENBQUM7U0FDbkUsSUFBSSxDQUFDLE9BQU8sQ0FBQztTQUNiLElBQUksQ0FBQyxRQUFRLENBQUM7U0FDZCxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDO1NBQzlCLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO1NBQ3RCLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRTVCLE9BQU8sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBVyxFQUFFLEVBQUU7UUFDL0IsR0FBRyxDQUFDLElBQUksQ0FBQyw0QkFBNEIsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUM3QyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDbkIsQ0FBQyxDQUFDLENBQUM7Q0FDTjtBQUNELE9BQU0sR0FBRyxFQUFFO0lBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUFFIn0=