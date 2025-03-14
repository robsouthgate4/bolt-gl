import { gunzipSync } from "fflate";

interface SceneObject {
  name: string;
  position: number[];
  rotation: number[];
  scale: number[];
  textures?: string[];
  materialColors?: number[];
  meshData: MeshData;
  isInstanced?: boolean;
}

interface MeshData {
  positions: Float32Array;
  normals: Float32Array;
  uvs: Float32Array | [];
  colors: Float32Array;
  indices: Uint16Array;
}

interface SceneDataObject {
  file: string;
  position: number[];
  rotation: number[];
  scale: number[];
  textures?: string[];
  materialColors?: number[];
  isInstanced?: boolean;
}

export default class BoltSceneLoader {
  private objects: SceneObject[] = [];
  private materials: any[] = [];
  private path = "";

  async load(path: string): Promise<void> {
    this.path = path;
    await this.loadScene();
  }

  private async loadScene(): Promise<void> {
    const scene = await fetch(`${this.path}/scene.json`);
    const sceneData: Record<string, SceneDataObject> = await scene.json();
    const objects = Object.keys(sceneData);

    for (const object of objects) {
      const {
        file,
        position,
        rotation,
        scale,
        textures,
        materialColors,
        isInstanced,
      } = sceneData[object];
      const meshData = await this.loadCompressedBinary(`${this.path}/${file}`);

      this.objects.push({
        name: object,
        position,
        rotation,
        scale,
        textures,
        materialColors,
        meshData,
        isInstanced,
      });
    }
  }

  private async loadCompressedBinary(url: string): Promise<MeshData> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const compressedData = new Uint8Array(buffer);
    const decompressedData = gunzipSync(compressedData);

    return this.parseBinary(decompressedData.buffer);
  }

  private parseBinary(buffer: ArrayBuffer): MeshData {
    const dataView = new DataView(buffer);
    let offset = 0;

    const numVertices = dataView.getUint32(offset, true);
    offset += 4;
    const numFaces = dataView.getUint32(offset, true);
    offset += 4;

    if (numVertices <= 0 || numFaces <= 0) {
      throw new Error("Invalid mesh data: zero or negative vertices or faces.");
    }
    if (buffer.byteLength < offset) {
      throw new Error("Invalid buffer size: insufficient data for header.");
    }

    const positions = new Float32Array(buffer, offset, numVertices * 3);
    offset += numVertices * 3 * 4;

    const normals = new Float32Array(buffer, offset, numVertices * 3);
    offset += numVertices * 3 * 4;

    const hasUVs = buffer.byteLength > offset + numFaces * 3 * 4;
    const uvs = hasUVs ? new Float32Array(buffer, offset, numVertices * 2) : [];
    if (hasUVs) offset += numVertices * 2 * 4;

    const colors = new Float32Array(buffer, offset, numVertices * 4);
    offset += numVertices * 4 * 4;

    const indices = new Uint16Array(buffer, offset, numFaces * 3);

    return { positions, normals, uvs: uvs as Float32Array, colors, indices };
  }
}
