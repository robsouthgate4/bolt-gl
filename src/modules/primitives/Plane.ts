import { vec3 } from "gl-matrix";

export default class Plane {
  indices: number[];
  positions: number[];
  normals: number[];
  uvs: number[];

  constructor({
    width = 1,
    height = 1,
    depth = 1,
    widthSegments = 1,
    heightSegments = 1,
  } = {}) {
    this.indices = [];
    this.positions = [];
    this.normals = [];
    this.uvs = [];

    const sw = width / widthSegments;
    const sh = height / heightSegments;

    const widthHalf = width / 2;
    const heightHalf = height / 2;

    const gridX1 = widthSegments + 1;
    const gridY1 = heightSegments + 1;

    let vertexCounter = 0;

    const vector = vec3.create();

    const u = 0;
    const v = 1;
    const w = 2;

    // 1. Generate all vertices
    for (let iy = 0; iy < gridY1; iy++) {
      const y = iy * sh - heightHalf;

      for (let ix = 0; ix < gridX1; ix++) {
        const x = ix * sw - widthHalf;

        vector[u] = x * 1;
        vector[v] = y * -1;
        vector[w] = 0;

        this.positions.push(vector[0], vector[1], vector[2]);

        vector[u] = 0;
        vector[v] = 0;
        vector[w] = depth > 0 ? 1 : -1;

        this.normals.push(vector[0], vector[1], vector[2]);

        this.uvs.push(ix / widthSegments);
        this.uvs.push(1 - iy / heightSegments);

        vertexCounter += 1;
      }
    }

    // ✅ 2. Generate indices AFTER all vertices
    for (let iy = 0; iy < heightSegments; iy++) {
      for (let ix = 0; ix < widthSegments; ix++) {
        const a = ix + gridX1 * iy;
        const b = ix + gridX1 * (iy + 1);
        const c = ix + 1 + gridX1 * (iy + 1);
        const d = ix + 1 + gridX1 * iy;

        this.indices.push(a, b, d);
        this.indices.push(b, c, d);
      }
    }
  }
}
