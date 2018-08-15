
import { User }         from './UserComm';
import { osaCommands }  from 'hsosaes6';

//import { Log } from 'hsnode'; const log = Log('hsUser');

export interface User {
    name:       string;         // name of the recipient
    email:      string[];       // list of valid email addresses.
                                // these will be used to authenticate incoming email commands
    AppleID?:   string;         // used to contact user via FaceTime or Messages
    group?:     [string];       // if present, messages will be sent to group members 
}

class UserList {
    users:any = {};
    defaultRecipient:User;
    emails = <{string: User}>{};

    constructor() {
        this.users.list = [];
    }

    addUser(user:User) {
        this.users[user.name] = user;
        this.users.list.push(user);
        if (user.email) {
            user.email.forEach(e => this.emails[e] = user);
        }   // else: group
    }

    userByEmail(email:string):User {
        return this.emails[email];
    }

    userByName(name?:string):User {
        return name? this.users[name] : this.defaultRecipient;
    }

    registeredUsers():string[] {
        return this.users.list.map((u:User) => u.name);
    }

    setDefaultRecipient(name:string) {
        return this.defaultRecipient = this.userByName(name); 
    }
}

export const users = new UserList();

export function message(users:User[], message:string, attachments?:string[]):Promise<boolean> {
    return osaCommands.sendMessage(users.map(u => u.AppleID), message, attachments);
}

export function videoChat(users:User[]):Promise<boolean> {
    return osaCommands.facetime(users[0].AppleID);
}

export function audioChat(users:User[]):Promise<boolean> {
    return Promise.resolve(false);
}

export function sendEmail(subject:string, to:User[], content: string, attachments?:string[]):Promise<boolean> {
    return osaCommands.sendEmail(subject, to.map(u=>u.email[0]), content, attachments);
}

export function getEmail(date:Date):Promise<any> {
    return osaCommands.getEmail(date);
}