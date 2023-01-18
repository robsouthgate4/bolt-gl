import { vec3 } from "gl-matrix";
import { Face } from "./Types";
/**
 * Generates an array of tangents from existing vertex buffers
 * @param  {number[]} vs array of vertices
 * @param  {number[]} tc array of texture coordinates
 * @param  {number[]} ind array of indices
 * @returns number
 */
export const calculateTangents = (
  vs: number[],
  tc: number[],
  ind: number[]
): number[] => {
  const tangents = [] as vec3[];

  for (let i = 0; i < vs.length / 3; i++) {
    tangents[i] = [0, 0, 0];
  }

  const a = [0, 0, 0] as vec3;
  const b = [0, 0, 0] as vec3;

  let triTangent = [0, 0, 0] as vec3;

  for (let i = 0; i < ind.length; i += 3) {
    const i0 = ind[i];
    const i1 = ind[i + 1];
    const i2 = ind[i + 2];

    const pos0 = <vec3>[vs[i0 * 3], vs[i0 * 3 + 1], vs[i0 * 3 + 2]];
    const pos1 = <vec3>[vs[i1 * 3], vs[i1 * 3 + 1], vs[i1 * 3 + 2]];
    const pos2 = <vec3>[vs[i2 * 3], vs[i2 * 3 + 1], vs[i2 * 3 + 2]];

    const tex0 = [tc[i0 * 2], tc[i0 * 2 + 1]];
    const tex1 = [tc[i1 * 2], tc[i1 * 2 + 1]];
    const tex2 = [tc[i2 * 2], tc[i2 * 2 + 1]];

    vec3.subtract(a, pos1, pos0);
    vec3.subtract(b, pos2, pos0);

    const c2c1b = tex1[1] - tex0[1];
    const c3c1b = tex2[0] - tex0[1];

    triTangent = [
      c3c1b * a[0] - c2c1b * b[0],
      c3c1b * a[1] - c2c1b * b[1],
      c3c1b * a[2] - c2c1b * b[2],
    ];

    vec3.add(triTangent, tangents[i0], triTangent);
    vec3.add(triTangent, tangents[i1], triTangent);
    vec3.add(triTangent, tangents[i2], triTangent);
  }

  // Normalize tangents
  const ts: number[] = [];
  tangents.forEach((tan: vec3) => {
    vec3.normalize(tan, tan);
    ts.push(tan[0]);
    ts.push(tan[1]);
    ts.push(tan[2]);
  });

  return ts;
};

/**
 * store mesh faces from vertices and indices
 */
export const storeFace = (
  indices: number[],
  positions: number[]
): { faces: Face[]; vertices: number[][] } => {
  const faces = [];
  const vertices = [];

  let ia, ib, ic;
  let a, b, c;

  // construct vertex vectors
  for (let i = 0; i < positions.length; i += 3) {
    vertices.push([positions[i + 0], positions[i + 1], positions[i + 2]]);
  }

  // generate face data
  for (let i = 0; i < indices.length; i += 3) {
    ia = indices[i];
    ib = indices[i + 1];
    ic = indices[i + 2];

    a = vertices[ia];
    b = vertices[ib];
    c = vertices[ic];

    const face: Face = {
      indices: [ia, ib, ic],
      vertices: [a, b, c],
    };

    faces.push(face);
  }

  return {
    faces,
    vertices,
  };
};

export const waitRAF = () => {
  return new Promise((resolve) => requestAnimationFrame(resolve));
};
