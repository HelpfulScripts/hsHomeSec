import { Log }      from 'hsnode';  const log = Log('alarm');
import { users, message}   from '../comm/UserComm';
import * as path    from 'path';


export function raiseAlarm(filePath:string) {
    log.warn(`motion alarm: writing '${filePath}'`);
    const ext = path.extname(filePath);
    if (ext === 'jpg' || ext === 'png') {
        message([users.userByName()], 'alarm', [filePath]);
    // } else {
    //     message([users.userByName()], 'alarm', [filePath]);
    }
}