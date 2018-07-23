
import { User }     from './hsUserComm';
import { osa }      from 'hsosaes6';

//import { Log } from 'hsnode'; const log = new Log('hsUser');

export interface User {
    name:       string;         // name of the recipient
    email:      string[];       // list of valid email addresses.
                                // these will be used to authenticate incoming email commands
    AppleID?:   string;         // used to contact user via FaceTime or Messages
    group?:     [string];       // if present, messages will be sent to group members 
}

class UserList {
    users:any = {};
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

    userByName(name:string):User {
        return this.users[name];
    }

    registeredUsers():string[] {
        return this.users.list.map((u:User) => u.name);
    }
}

export const users = new UserList();

export function message(users:User[], message:string, attachments?:string[]):Promise<boolean> {
    return osa.sendMessage(users.map(u => u.AppleID), message, attachments);
}

export function videoChat(users:User[]):Promise<boolean> {
    return osa.facetime(users[0].AppleID);
}

export function audioChat(users:User[]):Promise<boolean> {
    return Promise.resolve(false);
}

export function sendEmail(subject:string, to:User[], content: string, attachments?:string[]):Promise<boolean> {
    return osa.sendEmail(subject, to.map(u=>u.email[0]), content, attachments);
}

export function getEmail(date:Date):Promise<any> {
    return osa.getEmail(date);
}