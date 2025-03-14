import { Mesh, Node, Program, GeometryBuffers, MeshParams } from "../../../";
import Skin from "./Skin";
export default class SkinMesh extends Mesh {
    private _skin;
    private _jointTexture;
    constructor(geometry?: GeometryBuffers, params?: MeshParams);
    createTexture(skin: Skin): void;
    draw(program: Program, node: Node): void;
    get skin(): Skin | undefined;
    set skin(value: Skin | undefined);
}
