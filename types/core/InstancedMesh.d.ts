import Mesh from "./Mesh";
import Program from "./Program";
import Node from "./Node";
import { GeometryBuffers, MeshParams } from "./Types";
export default class InstancedMesh extends Mesh {
    private _instanceMatrices;
    private _instanceCount;
    private _instancedIBO;
    private gl;
    constructor(geometry: GeometryBuffers, params: MeshParams);
    setup(): void;
    setMatrixAt(index: number, matrix: Float32Array): void;
    draw(program?: Program, node?: Node): void;
}
