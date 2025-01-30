import { Bolt, Program, FBO } from "../../../";
import { Pass } from "./Pass";
interface ShaderPassParams {
    width: number;
    height: number;
    program: Program;
}
export default class ShaderPass extends Pass {
    program: Program;
    constructor(bolt: Bolt, { width, height, program }: ShaderPassParams);
    draw(readFBO: FBO, writeFbo: FBO, renderToScreen?: boolean): void;
}
export {};
