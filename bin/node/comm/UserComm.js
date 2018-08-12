"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hsosaes6_1 = require("hsosaes6");
class UserList {
    constructor() {
        this.users = {};
        this.emails = {};
        this.users.list = [];
    }
    addUser(user) {
        this.users[user.name] = user;
        this.users.list.push(user);
        if (user.email) {
            user.email.forEach(e => this.emails[e] = user);
        }
    }
    userByEmail(email) {
        return this.emails[email];
    }
    userByName(name) {
        return name ? this.users[name] : this.defaultRecipient;
    }
    registeredUsers() {
        return this.users.list.map((u) => u.name);
    }
    setDefaultRecipient(name) {
        return this.defaultRecipient = this.userByName(name);
    }
}
exports.users = new UserList();
function message(users, message, attachments) {
    return hsosaes6_1.osaCommands.sendMessage(users.map(u => u.AppleID), message, attachments);
}
exports.message = message;
function videoChat(users) {
    return hsosaes6_1.osaCommands.facetime(users[0].AppleID);
}
exports.videoChat = videoChat;
function audioChat(users) {
    return Promise.resolve(false);
}
exports.audioChat = audioChat;
function sendEmail(subject, to, content, attachments) {
    return hsosaes6_1.osaCommands.sendEmail(subject, to.map(u => u.email[0]), content, attachments);
}
exports.sendEmail = sendEmail;
function getEmail(date) {
    return hsosaes6_1.osaCommands.getEmail(date);
}
exports.getEmail = getEmail;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlckNvbW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbm9kZS9jb21tL1VzZXJDb21tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsdUNBQXdDO0FBWXhDO0lBS0k7UUFKQSxVQUFLLEdBQU8sRUFBRSxDQUFDO1FBRWYsV0FBTSxHQUFtQixFQUFFLENBQUM7UUFHeEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxPQUFPLENBQUMsSUFBUztRQUNiLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztRQUM3QixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0IsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ1osSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1NBQ2xEO0lBQ0wsQ0FBQztJQUVELFdBQVcsQ0FBQyxLQUFZO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBRUQsVUFBVSxDQUFDLElBQVk7UUFDbkIsT0FBTyxJQUFJLENBQUEsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztJQUMxRCxDQUFDO0lBRUQsZUFBZTtRQUNYLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVELG1CQUFtQixDQUFDLElBQVc7UUFDM0IsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN6RCxDQUFDO0NBQ0o7QUFFWSxRQUFBLEtBQUssR0FBRyxJQUFJLFFBQVEsRUFBRSxDQUFDO0FBRXBDLGlCQUF3QixLQUFZLEVBQUUsT0FBYyxFQUFFLFdBQXFCO0lBQ3ZFLE9BQU8sc0JBQVcsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDcEYsQ0FBQztBQUZELDBCQUVDO0FBRUQsbUJBQTBCLEtBQVk7SUFDbEMsT0FBTyxzQkFBVyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDbEQsQ0FBQztBQUZELDhCQUVDO0FBRUQsbUJBQTBCLEtBQVk7SUFDbEMsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2xDLENBQUM7QUFGRCw4QkFFQztBQUVELG1CQUEwQixPQUFjLEVBQUUsRUFBUyxFQUFFLE9BQWUsRUFBRSxXQUFxQjtJQUN2RixPQUFPLHNCQUFXLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQSxFQUFFLENBQUEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxXQUFXLENBQUMsQ0FBQztBQUN2RixDQUFDO0FBRkQsOEJBRUM7QUFFRCxrQkFBeUIsSUFBUztJQUM5QixPQUFPLHNCQUFXLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3RDLENBQUM7QUFGRCw0QkFFQyJ9