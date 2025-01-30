import { vec2 } from "gl-matrix";
import { BoltParams, Viewport } from "./Types";
import Node from "./Node";
import Camera from "./Camera";
export default class Bolt {
    private static _instance;
    private _gl;
    private _camera;
    private _dpi;
    private _viewport;
    private _autoSort;
    private _sortVec3;
    private _transparentNodes;
    private _opaqueNodes;
    private _activeProgram;
    private _activeTextureUnit;
    private _boundTexture;
    private _currentBlendFunction;
    private _currentCullFace;
    static getInstance(): Bolt;
    /**
     * Initialise a webgl context
     * @param  {HTMLCanvasElement} canvas html canvas element
     * @param  {BoltParams} {antialias} context params, antialias and DPI ( default 1 )
     */
    init(canvas: HTMLCanvasElement, { antialias, dpi, powerPreference, alpha, premultipliedAlpha, stencil, preserveDrawingBuffer, }: BoltParams): void;
    private printBanner;
    /**
     * Clear canvas with rgba colour components
     * @param  {number} r red
     * @param  {number} g green
     * @param  {number} b blue
     * @param  {number} a alpha
     */
    clear(r: number, g: number, b: number, a: number): void;
    scissor(x: number, y: number, w: number, h: number): void;
    /**
     * Set gl viewport offset and dimensions
     * @param  {number} x offset x
     * @param  {number} y offset y
     * @param  {number} width width of the viewport
     * @param  {number} height height of the viewport
     */
    setViewPort(x: number, y: number, width: number, height: number): void;
    /**
     * Attach a camera instance to the renderer
     * @param  {Camera} camera
     */
    setCamera(camera: Camera): void;
    get camera(): Camera;
    enableAlpha(): void;
    disableAlpha(): void;
    enableDepth(): void;
    disableDepth(): void;
    enableDepthWrite(): void;
    disableDepthWrite(): void;
    enableCullFace(): void;
    disableCullFace(): void;
    /**
     * @param  {number} face face to cull
     */
    cullFace(face: number): void;
    enableAlphaBlending(): void;
    enableAdditiveBlending(): void;
    /**
     * enable scissor test
     */
    enableScissor(): void;
    /**
     * disable scissor test
     */
    disableScissor(): void;
    /**
     * Returns gl context
     */
    getContext(): WebGL2RenderingContext;
    /**
     * Resizes the canvas to fit full screen
     * Updates the currently bound camera perspective
     */
    resizeCanvasToDisplay(canvas?: HTMLCanvasElement): void;
    resizeCanvasToSize(size: vec2): void;
    /**
     * @param  {DrawSet[]} nodes
     * calculate node depth from the currently bound camera
     */
    private sortByDepth;
    /**
     * Trigger a depth sort of opaque and transparent nodes
     */
    forceDepthSort(): void;
    /**
     * @param  {Node} drawables
     */
    draw(drawables: Node): void;
    get dpi(): number;
    set dpi(value: number);
    get viewport(): Viewport;
    get autoSort(): boolean;
    set autoSort(value: boolean);
    set activeProgram(id: number);
    get activeProgram(): number;
    get activeTextureUnit(): number;
    set activeTextureUnit(value: number);
    get boundTexture(): number;
    set boundTexture(value: number);
    get gl(): WebGL2RenderingContext;
}
