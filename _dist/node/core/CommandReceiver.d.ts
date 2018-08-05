import { User } from '../comm/UserComm';
export interface Command {
    commandFn: (query: string[]) => Promise<any>;
    command: string;
    params?: string;
}
export interface Query {
    event: any;
    command: string;
}
export declare function processCommand(cmd: string, from: User): Promise<any>;
export declare const addCommand: (cmdFn: any, cmd: string, options?: string) => void;
export declare const getCommands: () => string[];
export declare class EmailPolling {
    private ms;
    private processed;
    constructor(ms: number);
    private poll;
    private processMails;
    private cleanupProcessed;
}
