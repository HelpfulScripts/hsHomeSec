"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hsnode_1 = require("hsnode");
const log = new hsnode_1.Log('hsCmdRec');
const Exec = require("./CommandExecution");
const UserComm_1 = require("../comm/UserComm");
const UserComm_2 = require("../comm/UserComm");
const UserComm_3 = require("../comm/UserComm");
const UserComm_4 = require("../comm/UserComm");
const gCommands = [];
function interpretCommand(cmd, param, from) {
    const cmdObj = gCommands[cmd];
    if (cmdObj) {
        log.info(`received command '${cmd}' with param '${param.join('|')}' from '${from.name}'`);
        try {
            return cmdObj.commandFn(param);
        }
        catch (err) {
            console.trace(`error executing command '${cmd}': ${err}`);
        }
    }
    else {
        log.info(`received unkwon command '${cmd}'`);
        return Exec.sayFn([`${cmd} ${param.join(' ')}`])
            .catch(err => {
            log.error(`executing ${cmd}: ${err.toString()}`);
            return err.toString();
        });
    }
}
function informSender(cmd, content, from) {
    log.info(`informing ${from.name}: cmd '${cmd}' returned ${log.inspect(content, 0)}`);
    if (content) {
        return Promise.all([
            UserComm_4.sendEmail(`Re: ${cmd}`, [from], content.message, content.attachments),
            UserComm_3.message([from], content.message || '', content.attachments)
        ]);
    }
    else {
        log.error(`no content specified for cmd ${cmd} from ${from.name}`);
        return Promise.resolve();
    }
}
function processCommand(cmd, from) {
    if (from) {
        const completeCmd = cmd.split(' ');
        cmd = completeCmd[0];
        const param = completeCmd[1] || '';
        return interpretCommand(cmd, param.split(' '), from)
            .then((content) => informSender(cmd, content, from));
    }
    else {
        log.warn(`no valid sender found`);
        return Promise.resolve();
    }
}
exports.processCommand = processCommand;
exports.addCommand = (cmdFn, cmd, options) => {
    log.debug('adding command ' + cmd);
    var obj = { commandFn: cmdFn, command: cmd, options: options };
    gCommands.push(obj);
    gCommands[cmd] = obj;
};
exports.getCommands = () => {
    log.debug('getting list of command');
    return gCommands.map((c) => `${c.command} ${c.params}`);
};
;
class EmailPolling {
    constructor(ms) {
        this.ms = ms;
        this.processed = [];
        this.firstRun = true;
        setTimeout(this.poll.bind(this), this.ms);
        log.info(`started email polling every ${this.ms / 1000}s`);
    }
    poll() {
        const date = new Date(Date.now());
        date.setHours(date.getHours() - 1);
        UserComm_2.getEmail(date)
            .then(this.processMails.bind(this))
            .then(() => setTimeout(this.poll.bind(this), this.ms));
    }
    processMails(accounts) {
        log.debug(`processMails: \n${log.inspect(accounts, null)}`);
        accounts.forEach((a) => a.msgSinceDate.forEach((m) => {
            if (!this.processed['' + m.id]) {
                this.processed['' + m.id] = Date.now();
                if (this.firstRun) {
                    return;
                }
                const from = m.from.match(/<(.*)>/)[1];
                const user = UserComm_1.users.userByEmail(from);
                if (user) {
                    log.info(`processing email ${m.id} from ${user.name} with subject ${m.subject}`);
                    processCommand(m.subject.toLowerCase(), user);
                }
                else {
                    log.warn(`rejecting email ${m.id} from ${m.from} with subject ${m.subject}`);
                }
            }
            else {
                log.debug(`message id=${m.id} already proccessed of ${Object.keys(this.processed).length} total`);
            }
        }));
        this.cleanupProcessed();
        this.firstRun = false;
    }
    cleanupProcessed() {
        const ms = Date.now() - 24 * 60 * 60 * 1000;
        Object.keys(this.processed).forEach(k => { if (this.processed[k] < ms) {
            delete this.processed[k];
        } });
    }
}
exports.EmailPolling = EmailPolling;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbWFuZFJlY2VpdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL25vZGUvY29yZS9Db21tYW5kUmVjZWl2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFHQSxtQ0FBc0M7QUFBRyxNQUFNLEdBQUcsR0FBRyxJQUFJLFlBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUN6RSwyQ0FBa0Q7QUFDbEQsK0NBQWdEO0FBQ2hELCtDQUFnRDtBQUNoRCwrQ0FBNEM7QUFDNUMsK0NBQTRDO0FBc0I1QyxNQUFNLFNBQVMsR0FBYyxFQUFFLENBQUM7QUFRaEMsMEJBQTBCLEdBQVUsRUFBRSxLQUFjLEVBQUUsSUFBUztJQUMzRCxNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDOUIsSUFBSSxNQUFNLEVBQUU7UUFDUixHQUFHLENBQUMsSUFBSSxDQUFDLHFCQUFxQixHQUFHLGlCQUFpQixLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQzFGLElBQUk7WUFDQSxPQUFPLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDbEM7UUFDRCxPQUFNLEdBQUcsRUFBRTtZQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsNEJBQTRCLEdBQUcsTUFBTSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1NBQUU7S0FDNUU7U0FBTTtRQUNILEdBQUcsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLEdBQUcsR0FBRyxDQUFDLENBQUM7UUFDN0MsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDL0MsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ1QsR0FBRyxDQUFDLEtBQUssQ0FBQyxhQUFhLEdBQUcsS0FBSyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ2pELE9BQU8sR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzFCLENBQUMsQ0FBQyxDQUFDO0tBQ047QUFDTCxDQUFDO0FBRUQsc0JBQXNCLEdBQVUsRUFBRSxPQUFlLEVBQUUsSUFBUztJQUN4RCxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsSUFBSSxDQUFDLElBQUksVUFBVSxHQUFHLGNBQWMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JGLElBQUksT0FBTyxFQUFFO1FBQ1QsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDO1lBQ2Ysb0JBQVMsQ0FBQyxPQUFPLEdBQUcsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDO1lBQ3JFLGtCQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLENBQUMsT0FBTyxJQUFJLEVBQUUsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDO1NBQzlELENBQUMsQ0FBQztLQUNOO1NBQU07UUFDSCxHQUFHLENBQUMsS0FBSyxDQUFDLGdDQUFnQyxHQUFHLFNBQVMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7UUFDbkUsT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDNUI7QUFDTCxDQUFDO0FBRUQsd0JBQStCLEdBQVUsRUFBRSxJQUFTO0lBQ2hELElBQUksSUFBSSxFQUFFO1FBQ04sTUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNuQyxHQUFHLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDbkMsT0FBTyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUM7YUFDbkQsSUFBSSxDQUFDLENBQUMsT0FBZSxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0tBQ2hFO1NBQU07UUFDSCxHQUFHLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUM7UUFDbEMsT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDNUI7QUFDTCxDQUFDO0FBWEQsd0NBV0M7QUFTWSxRQUFBLFVBQVUsR0FBRyxDQUFDLEtBQVMsRUFBRSxHQUFVLEVBQUUsT0FBZSxFQUFFLEVBQUU7SUFDakUsR0FBRyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsR0FBRyxHQUFHLENBQUMsQ0FBQztJQUNuQyxJQUFJLEdBQUcsR0FBRyxFQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUMsT0FBTyxFQUFDLENBQUM7SUFDNUQsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNwQixTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ3pCLENBQUMsQ0FBQztBQU9XLFFBQUEsV0FBVyxHQUFHLEdBQUcsRUFBRTtJQUM1QixHQUFHLENBQUMsS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7SUFDckMsT0FBUSxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7QUFDN0QsQ0FBQyxDQUFDO0FBUUQsQ0FBQztBQVdGO0lBSUksWUFBb0IsRUFBUztRQUFULE9BQUUsR0FBRixFQUFFLENBQU87UUFIckIsY0FBUyxHQUFzQixFQUFFLENBQUM7UUFDbEMsYUFBUSxHQUFHLElBQUksQ0FBQztRQUdwQixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsK0JBQStCLElBQUksQ0FBQyxFQUFFLEdBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztJQUM3RCxDQUFDO0lBRU8sSUFBSTtRQUNSLE1BQU0sSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLG1CQUFRLENBQUMsSUFBSSxDQUFDO2FBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ2xDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDM0QsQ0FBQztJQUVPLFlBQVksQ0FBQyxRQUFZO1FBQzdCLEdBQUcsQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEdBQUcsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM1RCxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQVMsRUFBRSxFQUFFO1lBQ2pFLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUU7Z0JBQzFCLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ3JDLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtvQkFBRSxPQUFPO2lCQUFFO2dCQUM5QixNQUFNLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkMsTUFBTSxJQUFJLEdBQUcsZ0JBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3JDLElBQUksSUFBSSxFQUFFO29CQUNOLEdBQUcsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxFQUFFLFNBQVMsSUFBSSxDQUFDLElBQUksaUJBQWlCLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO29CQUNqRixjQUFjLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztpQkFDakQ7cUJBQU07b0JBQ0gsR0FBRyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsSUFBSSxpQkFBaUIsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7aUJBQ2hGO2FBQ0o7aUJBQU07Z0JBQ0gsR0FBRyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQyxFQUFFLDBCQUEwQixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFNLFFBQVEsQ0FBQyxDQUFDO2FBQ3JHO1FBQ0wsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNKLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO0lBQzFCLENBQUM7SUFFTyxnQkFBZ0I7UUFDcEIsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBQyxFQUFFLEdBQUMsRUFBRSxHQUFDLElBQUksQ0FBQztRQUN0QyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxJQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQUUsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQUUsQ0FBQSxDQUFDLENBQUMsQ0FBQztJQUMxRyxDQUFDO0NBQ0o7QUEzQ0Qsb0NBMkNDIn0=