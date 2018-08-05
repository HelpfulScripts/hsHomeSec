export interface FtpSettings {
    host: string;
    port: number;
    root: string;
    user: string;
    pwd: string;
}
export declare function getSettings(): FtpSettings;
export declare function start(baseDir: string, s: FtpSettings): Promise<void>;
