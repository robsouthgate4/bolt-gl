import { Bolt, Program, FBO, Texture2D } from "../../";
export interface FBOSwapDefinition {
    read: FBO;
    write: FBO;
    requiresSwap: boolean;
    shader: string;
    passName: string;
    program?: Program;
    initialTexture?: Texture2D;
    inputs?: {
        name: string;
    }[];
}
export default class FBOSim {
    private _FBOSwapDefinitions;
    private _triangleMesh;
    private _gl;
    private _bolt;
    private _outProgram;
    private _drawSetOut;
    private _drawSetblit;
    private _outputToScreen;
    private _throughProgram;
    private _isIos;
    constructor(bolt: Bolt, outPutToScreen?: boolean);
    private _runBlit;
    /**
     * bind fbos that require swappoing at run time
     * @param  {FBOSwapDefinition[]} fboDefinitions - array of FBO definitions
     */
    bindFBOs(fboDefinitions: FBOSwapDefinition[]): void;
    swapBuffers(fboSwapDefinition: FBOSwapDefinition): void;
    getTexture(passName: string): Texture2D | undefined;
    getProgram(passName: string): Program | undefined;
    compute(): void;
}
