export default class Cube {
    indices: number[];
    positions: number[];
    normals: number[];
    uvs: number[];
    constructor({ width, height, depth, widthSegments, heightSegments, depthSegments, }?: {
        width?: number | undefined;
        height?: number | undefined;
        depth?: number | undefined;
        widthSegments?: number | undefined;
        heightSegments?: number | undefined;
        depthSegments?: number | undefined;
    });
}
