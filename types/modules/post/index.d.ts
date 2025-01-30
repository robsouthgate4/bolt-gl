import { Bolt } from "../../";
import { Pass } from "./passes/Pass";
export default class Post {
    _height: number;
    _width: number;
    _passes: Pass[];
    bolt: Bolt;
    private _readFbo;
    private _writeFbo;
    private _writeRBO;
    private _readRBO;
    private _outputDepth;
    constructor(bolt: Bolt, { outputDepth }?: {
        outputDepth?: boolean | undefined;
    });
    add(pass: Pass, renderToScreen?: boolean): this;
    resize(width: number, height: number): void;
    swap(): void;
    begin(): void;
    end(): void;
}
