import { FtpSrv }   from 'ftp-srv';
import { Log }      from 'hsnode';  const log = new Log('ftp');
import { fs }       from 'hsnode'; 

export interface FtpSettings {
    host: string;
    port: number;
    root: string;
    user: string;
    pwd:  string;
}

const settings:FtpSettings = {
    host: '0.0.0.0',
    port:  21,
    root: '',
    user: 'one',
    pwd:  'two'
};

export function set(s:FtpSettings) {
    if (s.host) { settings.host = s.host; }
    if (s.port) { settings.port = s.port; }
    if (s.root) { settings.root = s.root; }
}

export function get():FtpSettings {
    return settings;
}

export function start(baseDir:string): Promise<void> { 
    settings.port = Math.floor(Math.random()*2000 + 1000);
    const ftpServer = new FtpSrv(`ftp://0.0.0.0:${settings.port}`);
    return fs.realPath(baseDir)
    .then((p:string) => fs.realPath(`${p}/${settings.root}`))
    .then((p:string):void => {
        settings.root = p;
        log.info(`ftp root ${settings.root}`);    
        ftpServer.on('login', (data, resolve, reject) => { 
            // const connection = data.connection;
            // const user = data.username;
            // const pw = data.password;
            log.info(`ftp login received: resolving for root "${settings.root}"`);
            if (data.username !== settings.user || data.password !== settings.pwd) {
                log.error(`wrong user/pwd: ${data.username}/${data.password}`);
                reject(new Error('nono'));
            }
            log.info('login accepted');
            resolve({root:settings.root, cwd:'./'});
        });  
        ftpServer.on('client-error', (data:any) => { 
            log.error(`client error received: ${data.error}`);
            log.error(data.context);
        });
        return ftpServer.listen();
    })
    .then(() => { log.info(`ftp server started on ${settings.host}:${settings.port}`); })
    .catch((err:any) => {
        log.error(`creating ftp server on ${settings.host}:${settings.port}`);
        log.error(err);
        ftpServer.close();
    });
}

