import { vec2 } from "gl-matrix";
import { Bolt, DrawSet, Node, Program } from "../../";
export interface PickingData {
    batch: DrawSet;
    id: number;
    initialShader: Program;
}
export default class GPUPicker {
    private _fbo;
    private _rbo;
    private _pickingProgram;
    private _bolt;
    private _canvas;
    private _pickingDataArray;
    private _gl;
    private _currentPickingID;
    private _camera;
    private _nearPlane;
    private _projectionMatrix;
    private _viewProjectionMatrix;
    constructor(bolt: Bolt);
    _getPickedID(mouse: vec2): void;
    /**
     * @param  {vec2} mouse mouse coordinate relative to thre canvas
     * @returns number the id of the picked object
     */
    pick(mouse: vec2): number;
    /**
     * @param  {Node|Node[]} nodes nodes to check for picking
     */
    setNodes(nodes: Node | Node[]): void;
    resize(): void;
    _generatePixelFrustum(): void;
    /**
     * Draws the picking objects to a framebuffer
     * Assigns picking program and passes ID as a uniform
     */
    _drawPickingBuffer(): void;
    /**
     * reset batches program to initial program before picking draw
     */
    _restoreShaders(): void;
    get currentPickingID(): number;
    set currentPickingID(value: number);
}
