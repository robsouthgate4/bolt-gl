interface QueueItem {
    url: string;
    type: string;
}
export declare enum AssetType {
    TEXTURE = 0,
    TEXTURE_CUBE = 1,
    GLTF = 2,
    AUDIO = 3,
    VIDEO = 4,
    HDR = 5
}
export default class AssetCache {
    private static _instance;
    private _queueItems;
    private _cacheObj;
    private _onProgressListeners;
    private _logs;
    private _debug;
    private _bolt;
    static getInstance(): AssetCache;
    init(assets: any): void;
    addProgressListener(fn: any): void;
    queue({ url, type, options }: {
        url: any;
        type: any;
        options: any;
    }): any;
    private _getQueued;
    private _extractType;
    get<T>(url: any): T;
    loadSingle(item: {
        url: string;
        type: AssetType;
    }): Promise<string | undefined>;
    load(concurrency?: number): Promise<void>;
    private _loadItem;
    private _log;
    private _logError;
    private _groupLog;
    get queueItems(): QueueItem[];
}
export {};
