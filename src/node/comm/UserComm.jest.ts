import * as user from './UserComm';


describe('UserComm', () => {
    let u:any;
    beforeAll(() => {
        u = {name:'Dude', email:['me@dude.com']};
        user.users.addUser(u);
    });
    it('should have user', () => {
        expect(user.users.userByName('Dude')).toEqual(u);
    });
    it('should have user', () => {
        expect(user.users.userByEmail('me@dude.com')).toEqual(u);
    });
});