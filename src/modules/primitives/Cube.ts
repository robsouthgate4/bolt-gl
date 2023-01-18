import { vec3 } from "gl-matrix";

export default class Cube {
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
    depthSegments = 1,
  } = {}) {
    widthSegments = Math.floor(widthSegments);
    heightSegments = Math.floor(heightSegments);
    depthSegments = Math.floor(depthSegments);

    this.indices = [];
    this.positions = [];
    this.normals = [];
    this.uvs = [];

    let numberOfVertices = 0;

    const buildPlane = (
      u: number,
      v: number,
      w: number,
      udir: number,
      vdir: number,
      width: number,
      height: number,
      depth: number,
      gridX: number,
      gridY: number
    ) => {
      const segmentWidth = width / gridX;
      const segmentHeight = height / gridY;

      const widthHalf = width / 2;
      const heightHalf = height / 2;
      const depthHalf = depth / 2;

      const gridX1 = gridX + 1;
      const gridY1 = gridY + 1;

      let vertexCounter = 0;

      const vector = vec3.create();

      for (let iy = 0; iy < gridY1; iy++) {
        const y = iy * segmentHeight - heightHalf;

        for (let ix = 0; ix < gridX1; ix++) {
          const x = ix * segmentWidth - widthHalf;

          vector[u] = x * udir;
          vector[v] = y * vdir;
          vector[w] = depthHalf;

          this.positions.push(vector[0], vector[1], vector[2]);

          vector[u] = 0;
          vector[v] = 0;
          vector[w] = depth > 0 ? 1 : -1;

          // now apply vector to normal buffer

          this.normals.push(vector[0], vector[1], vector[2]);

          // uvs

          this.uvs.push(ix / gridX);
          this.uvs.push(1 - iy / gridY);

          // counters

          vertexCounter += 1;
        }
      }

      for (let iy = 0; iy < gridY; iy++) {
        for (let ix = 0; ix < gridX; ix++) {
          const a = numberOfVertices + ix + gridX1 * iy;
          const b = numberOfVertices + ix + gridX1 * (iy + 1);
          const c = numberOfVertices + (ix + 1) + gridX1 * (iy + 1);
          const d = numberOfVertices + (ix + 1) + gridX1 * iy;

          this.indices.push(a, b, d);
          this.indices.push(b, c, d);
        }
      }

      numberOfVertices += vertexCounter;
    };

    buildPlane(
      2,
      1,
      0,
      -1,
      -1,
      depth,
      height,
      width,
      depthSegments,
      heightSegments
    ); // px
    buildPlane(
      2,
      1,
      0,
      1,
      -1,
      depth,
      height,
      -width,
      depthSegments,
      heightSegments
    ); // nx
    buildPlane(
      0,
      2,
      1,
      1,
      1,
      width,
      depth,
      height,
      widthSegments,
      depthSegments
    ); // py
    buildPlane(
      0,
      2,
      1,
      1,
      -1,
      width,
      depth,
      -height,
      widthSegments,
      depthSegments
    ); // ny
    buildPlane(
      0,
      1,
      2,
      1,
      -1,
      width,
      height,
      depth,
      widthSegments,
      heightSegments
    ); // pz
    buildPlane(
      0,
      1,
      2,
      -1,
      -1,
      width,
      height,
      -depth,
      widthSegments,
      heightSegments
    ); // nz
  }
}
