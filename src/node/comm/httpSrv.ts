
import * as http from 'http';
import { Log }   from 'hsnode'; const log = new Log('httpSrv');
import * as os   from 'os';
import * as url  from 'url';
import { interpretCommand  }    from '../core/hsCommandReceiver';
import { email }                from './hsUserComm';
import { users }                from './hsUserComm';

let gServer:any;

export const commandPort = 999;

export function start() {
    const port = commandPort;
    gServer = http.createServer(onRequest);
    gServer.listen(port);
    log.info('server started on http://' + os.hostname() + ':' + port + '/');
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
    const u = url.parse(request.url, true);
    const query = u.query;
    const completeCmd = query.cmd.split(' ');
    const cmd = completeCmd[0];
    const param = completeCmd[1]? completeCmd[1] : '';
    const sender:string = query.sender;
    log.info(`received message '${cmd}' '${param}' from '${sender}'`);

    const user = users.userByEmail(sender);

    request.setEncoding("utf8");
    request.addListener("data", function(/*postDataChunk*/) { });
    request.addListener("end", writeHeader(response, user!==undefined));

    if (user) {
        interpretCommand(cmd, param, user)
        .then(content => {
            content.attachments?
                email(`Re: ${cmd}`, [sender], '', content.attachments)
              : email(`Re: ${cmd}`, [sender], content);
        });
    }
}
