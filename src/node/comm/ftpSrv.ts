import { FtpSrv }       from 'ftp-srv';
import { newLog }          from 'hsnode';  const log = newLog('ftpSrv');
import { fs }           from 'hsnode'; 
import { raiseAlarm }   from '../core/alarm';

export interface FtpSettings {
    host: string;
    port?: number;
    root: string;
    user?: string;
    pwd?:  string;
}

const settings:FtpSettings = {
    host: '0.0.0.0',    // will be set during start via cfg file
    port:  21,          
    root: '',           // will be set during start()
    user: 'one',
    pwd:  'two'
};

export function getSettings():FtpSettings {
    return settings;
}

function login(data:any, resolve:any, reject:any) {
    data.connection.on('RETR', (error:string, filePath:string) => { 
        if (error) { log.error(`reading '${filePath}': ${error}`); }
              else { log.warn(`reading '${filePath}'`);}
    }); 
    data.connection.on('STOR', (error:string, filePath:string) => { 
        raiseAlarm(filePath);
        if (error) { log.error(`writing '${filePath}': ${error}`); }
        else { 
        }
    }); 
    log.debug(`ftp login received: resolving for root "${settings.root}"`);
    if (data.username !== settings.user || data.password !== settings.pwd) {
        log.error(`wrong user/pwd: ${data.username}/${data.password}`);
        reject(new Error('nono'));
    }
    log.debug(`login accepted for root "${settings.root}"`);
    resolve({root:settings.root, cwd:'./'});
}

export function start(baseDir:string, s:FtpSettings): Promise<void> { 
    settings.host = s.host;
//    settings.port = Math.floor(Math.random()*2000 + 1000);
    const ftpServer = new FtpSrv(`ftp://${settings.host}:${settings.port}`);
    const root = `${baseDir}/${s.root}`;
    log.debug(`testing ftp server root '${root}'`);
    return fs.realPath(root)
    .then((p:string):void => {
        settings.root = p;
        log.info(`ftp root ${settings.root}`);    
        ftpServer.on('login', login);  
        ftpServer.on('client-error', (data:any) => { 
            log.error(`client error received: context ${data.context} \n${log.inspect(data.error)}`);
        });
        return ftpServer.listen();
    })
    .then(() => { log.info(`ftp server started on ${settings.host}:${settings.port}`); })
    .catch((err:any) => {
        log.error(`creating ftp server on '${settings.host}:${settings.port}:/${settings.root}'`);
        log.error(err);
        ftpServer.close();
    });
}

