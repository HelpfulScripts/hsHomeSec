"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const hsnode_1 = require("hsnode");
const log = new hsnode_1.Log('httpSrv');
const os = require("os");
const url = require("url");
const CommandReceiver_1 = require("../core/CommandReceiver");
const UserComm_1 = require("./UserComm");
let gServer;
exports.commandPort = 999;
function start() {
    const port = exports.commandPort;
    try {
        gServer = http.createServer(onRequest);
        gServer.listen(port);
        log.info('server started on http://' + os.hostname() + ':' + port + '/');
    }
    catch (e) {
        log.error(`error starting server on port ${port}: ${e}`);
    }
}
exports.start = start;
function stop() {
    if (gServer) {
        gServer.close();
        log.info('closed server');
    }
    else {
        log.warn('attempt to close unitianilized server');
    }
}
exports.stop = stop;
function writeHeader(response, allowed) {
    return () => {
        response.writeHead(allowed ? 200 : 403, { "Content-Type": "text/plain" });
        response.write(allowed ? '' : '403 Forbidden');
        response.end();
    };
}
function onRequest(request, response) {
    let user;
    const query = url.parse(request.url, true).query;
    request.setEncoding("utf8");
    if (query.cmd) {
        const cmd = query.cmd;
        const sender = query.sender;
        log.debug(`received message '${cmd}' from '${sender}'`);
        user = UserComm_1.users.userByEmail(sender);
        request.addListener("end", writeHeader(response, user !== undefined));
        CommandReceiver_1.processCommand(cmd, user);
    }
    else {
        log.warn(`no cmd found: ${log.inspect(query)}`);
        request.addListener("end", writeHeader(response, false));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cFNydi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9ub2RlL2NvbW0vaHR0cFNydi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLDZCQUF3QztBQUN4QyxtQ0FBMEM7QUFBQyxNQUFNLEdBQUcsR0FBRyxJQUFJLFlBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMxRSx5QkFBc0M7QUFDdEMsMkJBQXVDO0FBQ3ZDLDZEQUEyRDtBQUMzRCx5Q0FBOEM7QUFFOUMsSUFBSSxPQUFXLENBQUM7QUFFSCxRQUFBLFdBQVcsR0FBRyxHQUFHLENBQUM7QUFFL0I7SUFDSSxNQUFNLElBQUksR0FBRyxtQkFBVyxDQUFDO0lBQ3pCLElBQUk7UUFDQSxPQUFPLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN2QyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JCLEdBQUcsQ0FBQyxJQUFJLENBQUMsMkJBQTJCLEdBQUcsRUFBRSxDQUFDLFFBQVEsRUFBRSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7S0FDNUU7SUFDRCxPQUFNLENBQUMsRUFBRTtRQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsaUNBQWlDLElBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQUU7QUFDMUUsQ0FBQztBQVJELHNCQVFDO0FBRUQ7SUFDSSxJQUFJLE9BQU8sRUFBRTtRQUNULE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNoQixHQUFHLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0tBQzdCO1NBQU07UUFDSCxHQUFHLENBQUMsSUFBSSxDQUFDLHVDQUF1QyxDQUFDLENBQUM7S0FDckQ7QUFDTCxDQUFDO0FBUEQsb0JBT0M7QUFFRCxxQkFBcUIsUUFBWSxFQUFFLE9BQWU7SUFDOUMsT0FBTyxHQUFHLEVBQUU7UUFDUixRQUFRLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxjQUFjLEVBQUUsWUFBWSxFQUFFLENBQUMsQ0FBQztRQUN6RSxRQUFRLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUM5QyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDbkIsQ0FBQyxDQUFDO0FBQ04sQ0FBQztBQVNELG1CQUFtQixPQUFXLEVBQUUsUUFBWTtJQUN4QyxJQUFJLElBQVMsQ0FBQztJQUNkLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUM7SUFDakQsT0FBTyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUU1QixJQUFJLEtBQUssQ0FBQyxHQUFHLEVBQUU7UUFDWCxNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDO1FBQ3RCLE1BQU0sTUFBTSxHQUFVLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFDbkMsR0FBRyxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsR0FBRyxXQUFXLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFFeEQsSUFBSSxHQUFHLGdCQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2pDLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxLQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDcEUsZ0NBQWMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDN0I7U0FBTTtRQUNILEdBQUcsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2hELE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztLQUM1RDtBQUNMLENBQUMifQ==