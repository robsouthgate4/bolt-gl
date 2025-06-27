/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
import { MeshoptDecoder } from "./MeshOptDecoder";

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
}

interface MeshDataIndices {
  indices: Uint16Array;
}

interface SceneDataObject {
  file: string;
  file_compressed?: string;
  file_compressed_indices?: string;
  position: number[];
  rotation: number[];
  scale: number[];
  textures?: string[];
  materialColors?: number[];
  isInstanced?: boolean;
  decode: Record<string, any>;
}

export default class BlenderSceneLoader {
  private objects: SceneObject[] = [];
  private materials: any[] = [];
  private path = "";
  private meshOptimize = false;
  constructor(meshOptimize?: boolean) {
    this.meshOptimize = meshOptimize ?? false;
  }

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
        file_compressed,
        file_compressed_indices,
        position,
        rotation,
        scale,
        textures,
        materialColors,
        isInstanced,
        decode,
      } = sceneData[object];

      const data = await this.loadCompressedBinary(
        `${this.path}/${file_compressed}`,
        `${this.path}/${file_compressed_indices}`,
        decode
      );

      const meshData = {
        ...data.vertexData,
        indices: data.indicesData.indices,
      };

      console.log(meshData);

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

  private async loadCompressedBinary(
    urlVertex: string,
    urlIndices: string,
    decode: Record<string, any>
  ): Promise<MeshData> {
    const responseVertex = await fetch(urlVertex);
    const responseIndices = await fetch(urlIndices);

    if (!responseVertex.ok || !responseIndices.ok) {
      throw new Error(`HTTP error! Status: ${responseVertex.status}`);
    }

    const bufferVertex = await responseVertex.arrayBuffer();
    const bufferIndices = await responseIndices.arrayBuffer();

    const compressedDataVertex = new Uint8Array(bufferVertex);
    const compressedDataIndices = new Uint8Array(bufferIndices);

    await MeshoptDecoder.ready;

    const vertexData = this.decodeVertexBuffer(compressedDataVertex, decode);
    const indicesData = this.decodeIndicesBuffer(compressedDataIndices, decode);

    return { vertexData, indicesData };
  }

  private decodeIndicesBuffer(
    buffer: ArrayBuffer,
    decode: Record<string, any>
  ): MeshDataIndices {
    const { indexCount } = decode;

    // Use correct stride for Uint16
    const stride = 2;

    // Create typed array for decoded output
    const decoded = new Uint16Array(indexCount);

    // Decode compressed buffer into this output
    MeshoptDecoder.decodeIndexBuffer!(
      new Uint8Array(decoded.buffer),
      indexCount,
      stride,
      new Uint8Array(buffer)
    );

    return { indices: decoded };
  }

  private decodeVertexBuffer(
    buffer: ArrayBuffer,
    decode: Record<string, any>
  ): MeshData {
    console.log(buffer);

    const stride = 48;

    const { vertexCount } = decode;

    const decoded = new Uint8Array(vertexCount * stride);

    MeshoptDecoder.decodeVertexBuffer!(decoded, vertexCount, stride, buffer);

    // Now interpret as floats:
    const decodedFloats = new Float32Array(decoded.buffer);

    // You can now slice out attributes:
    const positions = new Float32Array(vertexCount * 3);
    const normals = new Float32Array(vertexCount * 3);
    const uvs = new Float32Array(vertexCount * 2);
    const colors = new Float32Array(vertexCount * 4);

    for (let i = 0; i < vertexCount; i++) {
      const base = i * (stride / 4); // stride in floats
      positions.set(decodedFloats.slice(base, base + 3), i * 3);
      normals.set(decodedFloats.slice(base + 3, base + 6), i * 3);
      uvs.set(decodedFloats.slice(base + 6, base + 8), i * 2);
      colors.set(decodedFloats.slice(base + 8, base + 12), i * 4);
    }

    return {
      positions,
      normals,
      uvs,
      colors,
    };
  }
}
