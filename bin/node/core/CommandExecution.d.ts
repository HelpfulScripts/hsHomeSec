export declare function setSnapshotDir(dir: string): void;
export declare const helpFn: () => Promise<{
    message: string;
}>;
export declare const restartFn: () => Promise<{
    message: boolean;
}>;
export declare const snapFn: (params: string[]) => Promise<{
    attachments: string[];
}>;
export declare const camPreset: (params: string[]) => Promise<{
    attachments: string[];
}>;
export declare const facetimeFn: (username: string[]) => Promise<{
    message: string;
}>;
export declare const sayFn: (msg: string[]) => Promise<{
    message: string;
}>;
export declare const armFn: (param: string[]) => Promise<{
    message: string;
}>;
export declare const disarmFn: () => Promise<{
    message: string;
}>;
export declare const armingStatusFn: () => Promise<{
    message: {
        [x: string]: boolean;
    }[];
}>;
export declare const lightFn: (param: string[]) => Promise<{
    message: boolean;
}>;
