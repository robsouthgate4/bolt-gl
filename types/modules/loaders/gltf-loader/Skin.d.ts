import { Node, Program, Texture2D } from "../../../";
export default class Skin {
    private _joints;
    private _inverseBindMatrices;
    private _jointMatrices;
    private _jointData;
    private _globalWorldInverse;
    constructor(joints: Node[], inverseBindMatrixData: Float32Array);
    update(node: Node, program: Program, jointTexture: Texture2D | undefined): void;
    get jointData(): Float32Array;
    get joints(): Node[];
    set joints(value: Node[]);
    get jointMatrices(): Float32Array[];
    set jointMatrices(value: Float32Array[]);
}
