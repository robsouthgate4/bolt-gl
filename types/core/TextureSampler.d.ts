export default class TextureSampler {
    private _bolt;
    private _minFilter;
    private _magFilter;
    private _wrapS;
    private _wrapT;
    private _minLod;
    private _maxLod;
    private _compareMode;
    private _compareFunc;
    private _sampler;
    private _gl;
    constructor({ minFilter, magFilter, wrapS, wrapT, minLod, maxLod, compareMode, compareFunc, }?: {
        minFilter?: number | undefined;
        magFilter?: number | undefined;
        wrapS?: number | undefined;
        wrapT?: number | undefined;
        minLod?: number | undefined;
        maxLod?: number | undefined;
        compareMode?: number | undefined;
        compareFunc?: number | undefined;
    });
    private applySettings;
    /**
     * Binds the sampler to a texture unit
     * @param  {number} unit
     */
    bind(unit: number): void;
    unbind(unit: number): void;
}
