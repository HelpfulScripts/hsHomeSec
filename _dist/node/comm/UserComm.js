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
        return this.users[name];
    }
    registeredUsers() {
        return this.users.list.map((u) => u.name);
    }
}
exports.users = new UserList();
function message(users, message, attachments) {
    return hsosaes6_1.osa.sendMessage(users.map(u => u.AppleID), message, attachments);
}
exports.message = message;
function videoChat(users) {
    return hsosaes6_1.osa.facetime(users[0].AppleID);
}
exports.videoChat = videoChat;
function audioChat(users) {
    return Promise.resolve(false);
}
exports.audioChat = audioChat;
function sendEmail(subject, to, content, attachments) {
    return hsosaes6_1.osa.sendEmail(subject, to.map(u => u.email[0]), content, attachments);
}
exports.sendEmail = sendEmail;
function getEmail(date) {
    return hsosaes6_1.osa.getEmail(date);
}
exports.getEmail = getEmail;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlckNvbW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbm9kZS9jb21tL1VzZXJDb21tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsdUNBQW9DO0FBWXBDO0lBSUk7UUFIQSxVQUFLLEdBQU8sRUFBRSxDQUFDO1FBQ2YsV0FBTSxHQUFtQixFQUFFLENBQUM7UUFHeEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxPQUFPLENBQUMsSUFBUztRQUNiLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztRQUM3QixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0IsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ1osSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1NBQ2xEO0lBQ0wsQ0FBQztJQUVELFdBQVcsQ0FBQyxLQUFZO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBRUQsVUFBVSxDQUFDLElBQVc7UUFDbEIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFRCxlQUFlO1FBQ1gsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNuRCxDQUFDO0NBQ0o7QUFFWSxRQUFBLEtBQUssR0FBRyxJQUFJLFFBQVEsRUFBRSxDQUFDO0FBRXBDLGlCQUF3QixLQUFZLEVBQUUsT0FBYyxFQUFFLFdBQXFCO0lBQ3ZFLE9BQU8sY0FBRyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLE9BQU8sRUFBRSxXQUFXLENBQUMsQ0FBQztBQUM1RSxDQUFDO0FBRkQsMEJBRUM7QUFFRCxtQkFBMEIsS0FBWTtJQUNsQyxPQUFPLGNBQUcsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzFDLENBQUM7QUFGRCw4QkFFQztBQUVELG1CQUEwQixLQUFZO0lBQ2xDLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNsQyxDQUFDO0FBRkQsOEJBRUM7QUFFRCxtQkFBMEIsT0FBYyxFQUFFLEVBQVMsRUFBRSxPQUFlLEVBQUUsV0FBcUI7SUFDdkYsT0FBTyxjQUFHLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQSxFQUFFLENBQUEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxXQUFXLENBQUMsQ0FBQztBQUMvRSxDQUFDO0FBRkQsOEJBRUM7QUFFRCxrQkFBeUIsSUFBUztJQUM5QixPQUFPLGNBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDOUIsQ0FBQztBQUZELDRCQUVDIn0=