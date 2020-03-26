
import * as http            from 'http';
import { Log }              from 'hsnode';  const log = new Log('httpSrv');
import * as os              from 'os';
import * as url             from 'url';
import { processCommand }   from '../core/CommandReceiver';
import { users, User }      from './UserComm';

let gServer:any;

export const commandPort = 999;

export function start() {
    const port = commandPort;
    try {
        gServer = http.createServer(onRequest);
        gServer.listen(port);
        log.info('server started on http://' + os.hostname() + ':' + port + '/');
    }
    catch(e) { log.error(`error starting server on port ${port}: ${e}`); }
}

export function stop() {
    if (gServer) {
        gServer.close();
        log.info('closed server');
    } else {
        log.warn('attempt to close unitianilized server');
    }
}

function writeHeader(response:any, allowed:boolean) {
    return () => {
        response.writeHead(allowed? 200 : 403, { "Content-Type": "text/plain" });
        response.write(allowed? '' : '403 Forbidden');
        response.end();
    };
}

/**
 * listens to commands issued to `commandPort` on this machine.
 * Format:
 * `http://x.x.x.x/?cmd=<cmd param>&sender=<sender>`
 * @param request 
 * @param response 
 */
function onRequest(request:any, response:any) {
    let user:User;
    const query:any = url.parse(request.url, true).query;
    request.setEncoding("utf8");

    if (query.cmd) {
        const cmd:string = <string>query.cmd;
        const sender:string = <string>query.sender;
        log.debug(`received message '${cmd}' from '${sender}'`);

        user = users.userByEmail(sender);
        request.addListener("end", writeHeader(response, user!==undefined));
        processCommand(cmd, user);
    } else {
        log.warn(`no cmd found: ${log.inspect(query)}`);
        request.addListener("end", writeHeader(response, false));
    }
}
