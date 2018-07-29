/**
 * uses a http server to listens for commands via http requests
 */
import { Log }          from 'hsnode';   const log = new Log('hsCmdRec');
import * as Exec        from './CommandExecution';
import { User, users }  from '../comm/UserComm';
import { getEmail }     from '../comm/UserComm';
import { message }  from '../comm/UserComm';
import { sendEmail }from '../comm/UserComm';


export interface Command {
    /** the command function to execute */
    commandFn: (query:string[]) => Promise<any>;
    /** the command keyword */
    command: string;
    /** possible command parameters */
    params?: string;
}

export interface Query {
    event: any;
    command: string;
}

interface Content {
    message?:       string;
    attachments?:   any[];
}

const gCommands = <Command[]>[];

/**
 * 
 * @param cmd 
 * @param param 
 * @param from originating user 
 */
function interpretCommand(cmd:string, param:string[], from:User):Promise<any> {
    const cmdObj = gCommands[cmd];
    if (cmdObj) { 
        log.info(`received command '${cmd}' with param '${param.join('|')}' from '${from.name}'`);
        try { 
            return cmdObj.commandFn(param);
        }
        catch(err) { console.trace(`error executing command '${cmd}': ${err}`); }
    } else { 
        log.info(`received unkwon command '${cmd}'`);
        return Exec.sayFn([`${cmd} ${param.join(' ')}`])
        .catch(err => {
            log.error(`executing ${cmd}: ${err.toString()}`);
            return err.toString();
        });
    }
} 

function informSender(cmd:string, content:Content, from:User): Promise<any> {
    log.info(`informing ${from.name}: cmd '${cmd}' returned ${log.inspect(content, 0)}`);
    if (content) {
        return Promise.all([
            sendEmail(`Re: ${cmd}`, [from], content.message, content.attachments),
            message([from], content.message || '', content.attachments)
        ]);
    } else {
        log.error(`no content specified for cmd ${cmd} from ${from.name}`);
        return Promise.resolve();
    }
}

export function processCommand(cmd:string, from:User):Promise<any> {
    if (from) {
        const completeCmd = cmd.split(' ');
        cmd = completeCmd[0];
        const param = completeCmd[1] || '';
        return interpretCommand(cmd, param.split(' '), from)
        .then((content:Content) => informSender(cmd, content, from));
    } else {
        log.warn(`no valid sender found`);
        return Promise.resolve();
    }
}

/**
 * adds a command and a corresponding callback function to the list of 
 * registered commands.
 * @param cmdFn the function to call when the command is received.
 * @param cmd the command to add.
 * @param options optional; 
 */
export const addCommand = (cmdFn:any, cmd:string, options?:string) => {
    log.debug('adding command ' + cmd);
    var obj = {commandFn: cmdFn, command: cmd, options:options};
    gCommands.push(obj);
    gCommands[cmd] = obj;
};

/**
 * adds a command and a corresponding callback function to the list of 
 * registered commands.
 * @return an array of command strings
 */
export const getCommands = () => {
    log.debug('getting list of command');
    return  gCommands.map((c) => `${c.command} ${c.params}`);
};


interface Message {
    from:           string;
    subject:        string;
    received:       string;
    id:             number;
};

interface Account {
    account:        string;
    inbox:          string;
    numMsgTotal:    number;
    numMsgNew:      number;
    dateSince:      string;     // cut-off date: all returned emails are younger
    msgSinceDate:   Message[];
}

export class EmailPolling {
    private processed = <{string:number}[]>[];

    constructor(private ms:number) {
        setTimeout(this.poll.bind(this), this.ms);
        log.info(`started email polling every ${this.ms/1000}s`);
    }
    
    private poll() {
        const date = new Date(Date.now());
        date.setHours(date.getHours()-1);
        getEmail(date)
        .then(JSON.parse)
        .then(this.processMails.bind(this))
        .then(() => setTimeout(this.poll.bind(this), this.ms));
    }

    private processMails(accounts:any) {
        log.debug(`processMails: \n${log.inspect(accounts, null)}`);
        accounts.forEach((a:Account) => a.msgSinceDate.forEach((m:Message) => {
            if (!this.processed[''+m.id]) {
                this.processed[''+m.id] = Date.now();
                const from = m.from.match(/<(.*)>/)[1];
                const user = users.userByEmail(from);
                if (user) {
                    log.info(`processing email ${m.id} from ${user.name} with subject ${m.subject}`);
                    processCommand(m.subject.toLowerCase(), user);
                } else {
                    log.warn(`rejecting email ${m.id} from ${m.from} with subject ${m.subject}`);
                }
            } else {
                log.debug(`message id=${m.id} already proccessed of ${Object.keys(this.processed).length} total`);
            }
        }));
        this.cleanupProcessed();
    }

    private cleanupProcessed() {
        const ms = Date.now() - 24*60*60*1000;     // remove mails processed more than 24h back.
        Object.keys(this.processed).forEach(k => { if(this.processed[k] < ms) { delete this.processed[k]; }});
    }
}