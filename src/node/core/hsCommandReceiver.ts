/**
 * uses a http server to listens for commands via http requests
 */
import { Log }   from 'hsnode';   const log = new Log('hsCmdRec');
import * as Exec from './hsCommandExecution';
import { User }  from '../comm/hsUserComm';


export interface Command {
    command: string;
    commandFn: (query:string[]) => Promise<any>;
    desc?: string;
}

export interface Query {
    event: any;
    command: string;
}


const gCommands = <Command[]>[];

/**
 * 
 * @param cmd 
 * @param param 
 * @param from originating user 
 */
export function interpretCommand(cmd:string, param:string, from:User):Promise<any> {
    const cmdObj = gCommands[cmd];
    if (cmdObj) { 
        log.info(`received command '${cmd}' with param '${param}' from '${from.name}'`);
        try { return cmdObj.commandFn(param); }
        catch(err) { console.trace(`error executing command '${cmd}': ${err}`); }
    } else { 
        log.info(`received unkwon command '${cmd}'`);
        return Exec.sayFn(cmd + ' ' + param)
        .catch(err => {
            log.error(`executing ${cmd}: ${err.toString()}`);
            return err.toString();
        });
    }
} 

/**
 * adds a command and a corresponding callback function to the list of 
 * registered commands.
 * @param string cmd the command to add.
 * @param function cmdFn the function to call when the command is received.
 * @param string desc optional; 
 */
export const addCommand = (cmd:string, cmdFn:any, desc?:string) => {
    log.debug('adding command ' + cmd);
    var obj = {command: cmd, commandFn: cmdFn, desc:desc||cmd};
    gCommands.push(obj);
    gCommands[cmd] = obj;
};

/**
 * adds a command and a corresponding callback function to the list of 
 * registered commands.
 * @return string[ ] an array of command strings
 */
export const getCommands = () => {
    log.debug('getting list of command');
    return  gCommands.map((c) => c.desc);
};
