import Texture2D from "./Texture2D";
export default class FBO {
    private _width;
    private _height;
    private _targetTexture;
    private _frameBuffer;
    private _gl;
    private _depthTexture?;
    private _attachmentIds;
    private _attachmentTextures;
    private _bolt;
    private _depth;
    private _MSAAFramebuffers;
    private _samples;
    private _isMSAA;
    private _msaaBuffers;
    private _msaaColorRenderBuffer;
    private _msaaDepthBuffer;
    private _name;
    private _rbo;
    private _msaaDepthTexture;
    constructor({ width, height, depth, samples, type, internalFormat, format, generateMipmaps, minFilter, magFilter, wrapS, wrapT, name, }?: {
        width?: number | undefined;
        height?: number | undefined;
        depth?: boolean | undefined;
        samples?: number | undefined;
        type?: number | undefined;
        internalFormat?: number | undefined;
        format?: number | undefined;
        generateMipmaps?: boolean | undefined;
        minFilter?: number | undefined;
        magFilter?: number | undefined;
        wrapS?: number | undefined;
        wrapT?: number | undefined;
        name?: string | undefined;
    });
    private initMSAA;
    private attachDepthTexture;
    private attachRBO;
    clear(r?: number, g?: number, b?: number, a?: number): void;
    /**
     * Add an attachment to the framebuffer ( multi render targets )
     * @param  {Texture2D} texture
     * @param  {number} id
     */
    addAttachment(texture: Texture2D, id: number): void;
    /**
     * Set draw buffers for the framebuffer
     */
    setDrawBuffers(): void;
    /**
     * resize the framebuffer and all attachments
     * @param  {number} width width of the framebuffer
     * @param  {number} height height of the framebuffer
     */
    resize(width: number, height: number): void;
    /**
     * @param  {} updateViewPort=true if true, update the viewport to the size of the framebuffer
     */
    bind(updateViewPort?: boolean): void;
    unbind(updateViewPort?: boolean): void;
    delete(): void;
    get width(): number;
    set width(value: number);
    get height(): number;
    set height(value: number);
    get targetTexture(): Texture2D;
    get frameBuffer(): WebGLFramebuffer;
    get attachments(): number[];
    set attachments(value: number[]);
    get depthTexture(): Texture2D | undefined;
    get msaaDepthTexture(): Texture2D | undefined;
    get name(): string;
}
