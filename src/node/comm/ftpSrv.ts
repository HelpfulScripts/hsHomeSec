//import { FtpSrv }   from '../../../ftp-srv';
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
    host: '0.0.0.0',    // will be set during start via cfg file
    port:  21,          
    root: '',           // will be set during start()
    user: 'one',
    pwd:  'two'
};

export function getSettings():FtpSettings {
    return settings;
}

export function start(baseDir:string, s:FtpSettings): Promise<void> { 
    settings.host = s.host;
//    settings.port = Math.floor(Math.random()*2000 + 1000);
    const ftpServer = new FtpSrv(`ftp://${settings.host}:${settings.port}`);
    return fs.realPath(baseDir + s.root)
    .then((p:string):void => {
        settings.root = p;
        log.info(`ftp root ${settings.root}`);    
        ftpServer.on('login', (data, resolve, reject) => {
            (<any>data.connection).on('RETR', (error:string, filePath:string) => { 
//            data.connection.on('RETR', (error:string, filePath:string) => { 
                    if (error) { log.error(`reading '${filePath}': ${error}`); }
                      else { log.info(`reading '${filePath}'`);}
            }); 
            (<any>data.connection).on('STOR', (error:string, filePath:string) => { 
//            data.connection.on('STOR', (error:string, filePath:string) => { 
            if (error) { log.error(`writing '${filePath}': ${error}`); }
                      else { log.info(`writing '${filePath}'`);}
            }); 
            log.debug(`ftp login received: resolving for root "${settings.root}"`);
            if (data.username !== settings.user || data.password !== settings.pwd) {
                log.error(`wrong user/pwd: ${data.username}/${data.password}`);
                reject(new Error('nono'));
            }
            log.info(`login accepted for root "${settings.root}"`);
            resolve({root:settings.root, cwd:'./'});
        });  
        ftpServer.on('client-error', (data:any) => { 
            log.error(`client error received: context ${data.context} \n${log.inspect(data.error)}`);
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

