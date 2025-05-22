import { Bolt, VBO, AttribPointer, Program } from "../../";
export interface VBOSwapDefinition {
    read: VBO;
    write: VBO;
    attributeLocation: number | AttribPointer;
    size: number;
    requiresSwap: boolean;
    stride?: number;
    offset?: number;
}
export default class TransformFeedback {
    private _gl;
    private _readVAO;
    private _writeVAO;
    private _vboSwapDefinitions;
    private _tf1;
    private _tf2;
    private _boundBuffers;
    private _read;
    private _write;
    private _count;
    private _logBufferContents;
    private _logAttributeLocation;
    private _stride;
    constructor({ bolt, count, stride, }: {
        bolt: Bolt;
        count: number;
        stride: number;
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
    getReadVBO(location: number): VBO | undefined;
    getWriteVBO(location: number): VBO | undefined;
    compute(program?: Program): void;
    logBufferContents(value: boolean, attributeLocation: number): void;
    destroy(): void;
}
