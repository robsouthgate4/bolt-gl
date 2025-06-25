export default class BlenderSceneLoader {
    private objects;
    private materials;
    private path;
    private meshOptimize;
    constructor(meshOptimize?: boolean);
    load(path: string): Promise<void>;
    private loadScene;
    private loadCompressedBinary;
    private parseBinary;
    private parseBinaryOptimized;
}
