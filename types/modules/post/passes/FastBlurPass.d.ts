import { Bolt, Program, FBO, Texture2D } from "../../../";
import { Pass } from "./Pass";
interface FastBlurPassParams {
    width: number;
    height: number;
    iterations?: number;
    customBlurShader?: string;
    inputTexture?: Texture2D;
}
export default class FastBlurPass extends Pass {
    private _iterations;
    program: Program;
    fbo: FBO;
    private _rbo;
    private _inputTexture?;
    constructor(bolt: Bolt, { width, height, iterations, customBlurShader, inputTexture, }: FastBlurPassParams);
    resize(width: number, height: number): void;
    draw(readFBO: FBO, writeFBO: FBO, renderToScreen?: boolean): void;
    get inputTexture(): Texture2D | undefined;
    set inputTexture(value: Texture2D | undefined);
}
export {};
