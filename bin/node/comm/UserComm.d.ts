import { User } from './UserComm';
export interface User {
    name: string;
    email: string[];
    AppleID?: string;
    group?: [string];
}
declare class UserList {
    users: any;
    defaultRecipient: User;
    emails: {
        string: User;
    };
    constructor();
    addUser(user: User): void;
    userByEmail(email: string): User;
    userByName(name?: string): User;
    registeredUsers(): string[];
    setDefaultRecipient(name: string): User;
}
export declare const users: UserList;
export declare function message(users: User[], message: string, attachments?: string[]): Promise<boolean>;
export declare function videoChat(users: User[]): Promise<boolean>;
export declare function audioChat(users: User[]): Promise<boolean>;
export declare function sendEmail(subject: string, to: User[], content: string, attachments?: string[]): Promise<boolean>;
export declare function getEmail(date: Date): Promise<any>;
export {};
