import { Bolt, FBO, Mesh, Texture2D } from "../../../";
export declare abstract class Pass {
    private _fullScreenTriangle;
    private _renderToScreen;
    private _enabled;
    protected _texture: Texture2D | undefined;
    protected _width: number;
    protected _height: number;
    protected _bolt: Bolt;
    _hasCustomFBO: boolean;
    fbo?: FBO;
    requiresSwap: boolean;
    constructor(bolt: Bolt, { texture }: {
        width: number;
        height: number;
        texture?: Texture2D;
    });
    resize(width: number, height: number): void;
    setEnabled(val: boolean): this;
    set enabled(val: boolean);
    get enabled(): boolean;
    set renderToScreen(val: boolean);
    get renderToScreen(): boolean;
    get fullScreenTriangle(): Mesh;
    set fullScreenTriangle(value: Mesh);
    get texture(): Texture2D | undefined;
    abstract draw(readFBO: FBO, writeFbo: FBO, renderToScreen?: boolean): void;
}
