import { log as gLog }  from 'hsnode';  const log = gLog('alarm');
import { users}         from '../comm/UserComm';
import { message}       from '../comm/UserComm';
import { sayFn }        from './CommandExecution';
import * as path        from 'path';
import { Settings }     from './Settings';

let alarmText = '';

export function setAlarmText(settings:Settings):Settings {
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