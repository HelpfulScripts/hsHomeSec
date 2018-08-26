import * as Comm        from './CommandReceiver';
// import { log }          from 'hsnode';  log.level(log.DEBUG, true);
// import { osaCommands }  from 'hsosaes6';

// jest.mock('Comm');

const me = {name:'me', email:['me@a.com']};

describe('CommandReceiver', () => {
    describe('commands', () => {
        beforeAll(() => {
            Comm.addCommand(()=>Promise.resolve({message:'help text'}), 'help');
        });
        test('getCommands', () => 
            expect(Comm.getCommands().length).toBe(1)
        );
        test('help', () => Comm.processCommand('help', me).then(res => 
            expect(res).toEqual(["", ""])
        ));
        test('snap', () => Comm.processCommand('snap', me).then(res => 
            expect(res).toEqual(["", ""])
        ));
        test('processCommand invalid command', () => Comm.processCommand('not a command', me).then(res => 
            expect(res).toEqual(["", ""])
        ));
    });
    // describe('EmailPolling', () => {
    //     new Comm.EmailPolling(5000);

    // });
});
