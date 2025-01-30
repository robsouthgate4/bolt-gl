import { Bolt, VBO, AttribPointer, Program } from "../../";
export interface VBOSwapDefinition {
    vbo1: VBO;
    vbo2: VBO;
    attributeLocation: number | AttribPointer;
    size: number;
    requiresSwap: boolean;
}
export default class TransformFeedback {
    private _gl;
    private _vao1;
    private _vao2;
    private _vboSwapDefinitions;
    private _tf1;
    private _tf2;
    private _current;
    private _next;
    private _count;
    constructor({ bolt, count }: {
        bolt: Bolt;
        count: number;
    });
    /**
     * bind vbos that require swappoing at run time
     * @param  {VBOSwapDefinition[]} vboDefinitions - array of VBO definitions
     */
    bindVAOS(vboDefinitions: VBOSwapDefinition[]): void;
    private _createTransformFeedback;
    private _initTransformFeedback;
    private _linkAttribs;
    private _swapBuffers;
    compute(program?: Program): void;
}
