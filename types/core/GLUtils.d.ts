import { Face } from "./Types";
/**
 * Generates an array of tangents from existing vertex buffers
 * @param  {number[]} vs array of vertices
 * @param  {number[]} tc array of texture coordinates
 * @param  {number[]} ind array of indices
 * @returns number
 */
export declare const calculateTangents: (vs: number[], tc: number[], ind: number[]) => number[];
/**
 * store mesh faces from vertices and indices
 */
export declare const storeFace: (indices: number[], positions: number[]) => {
    faces: Face[];
    vertices: number[][];
};
export declare const waitRAF: () => Promise<unknown>;
export declare const flattenFloatArray: (arr: Float32Array[]) => Float32Array;
