import { mat4, vec3 } from "gl-matrix";
import Transform from "./Transform";
import Program from "./Program";
import Camera from "./Camera";
/**
 * Node class
 * Holds scene graph data
 * Contains object transforms
 */
export default class Node {
    private _localMatrix;
    private _modelMatrix;
    private _autoUpdate;
    private _children;
    private _parent;
    private _name;
    private _transform;
    private _normalMatrix;
    private _modelViewMatrix;
    private _inverseModelViewMatrix;
    private _draw;
    private _cameraDepth;
    private _abstractData;
    private _isJoint;
    constructor();
    /**
     * Attaches this node to a parent node
     * @param  {Node} parent
     */
    setParent(parent: Node): void;
    /**
     * Loops over all child nodes and executes a call back function
     * @param  {Function} fn
     */
    traverse(fn: (node: Node) => void): void;
    /**
     * Updates this node's model matrix relative to the current node chain
     * @param  {mat4} parentModelMatrix?
     */
    updateModelMatrix(parentModelMatrix?: mat4): void;
    /**
     * Adds child to current node to chain
     * @param  {Node} child
     */
    addChild(child: Node): void;
    /**
     * Removes child node from current node chain
     * @param  {Node} child
     */
    removeChild(child: Node): void;
    /**
     * Updates each node's model matrix
     * Set's projection, view and model matrix uniforms of given program
     * @param  {Program} program
     * @param  {Camera} camera
     */
    updateMatrices(program: Program, camera: Camera): void;
    /**
     * Returns the world matrix relative to this nodes parent
     * @returns mat4
     */
    get worldMatrix(): mat4;
    /**
     * Returns the world position of this node
     * @returns vec3
     */
    get worldPosition(): vec3;
    get modelMatrix(): mat4;
    set modelMatrix(value: mat4);
    get localMatrix(): mat4;
    set localMatrix(value: mat4);
    get children(): Node[];
    set children(value: Node[]);
    get parent(): Node | null;
    set parent(value: Node | null);
    get transform(): Transform;
    set transform(value: Transform);
    get name(): string;
    set name(value: string);
    get draw(): boolean;
    set draw(value: boolean);
    get autoUpdate(): boolean;
    set autoUpdate(value: boolean);
    get cameraDepth(): number;
    set cameraDepth(value: number);
    get abstractData(): unknown;
    set abstractData(value: unknown);
    get isJoint(): boolean;
    set isJoint(value: boolean);
}
