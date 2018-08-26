const osa = jest.genMockFromModule('hsosaes6');


osa.osaCommands.sendMessage = (appleIDs, message, attachments) => Promise.resolve('');
osa.osaCommands.sendEmail = (subject, to, content, attachments) => Promise.resolve('');
osa.osaCommands.getEmail = (date) => Promise.resolve('');
osa.osaCommands.facetime = (appleID) => Promise.resolve('');
osa.osaCommands.say = (text) => Promise.resolve('');
osa.osaCommands.launch = (name) => Promise.resolve(true);
osa.osaCommands.launchScript = (name) => Promise.resolve(true);
osa.osaCommands.quit = (name) => Promise.resolve(true);
osa.osaCommands.isRunning = (name) => Promise.resolve(true);
osa.osaCommands.setBrightness = (value) => Promise.resolve(true);
osa.osaCommands.setVolume = (value) => Promise.resolve('');
osa.osaCommands.getVolume = () => Promise.resolve('');
osa.osaCommands.restart = () => {console.log('osa mock'); return Promise.resolve(''); }

module.exports = osa;
