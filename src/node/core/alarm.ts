import { Log }          from 'hsnode';  const log = new Log('alarm');
import { users}         from '../comm/UserComm';
import { message}       from '../comm/UserComm';
import { sayFn }        from './CommandExecution';
import * as path        from 'path';
import { CfgSettings }  from './CfgSettings';

let alarmText = '';

export function setAlarmText(settings:CfgSettings):CfgSettings {
    alarmText = settings.alarmText;
    return settings;
}

export function raiseAlarm(filePath:string) {
    log.warn(`motion alarm: writing '${filePath}'`);
    sayFn([alarmText]);
    const ext = path.extname(filePath);
    if (ext === 'jpg' || ext === 'png') {
        message([users.userByName()], 'alarm', [filePath]);
    // } else {
    //     message([users.userByName()], 'alarm', [filePath]);
    }
}