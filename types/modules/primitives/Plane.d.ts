export default class Plane {
    indices: number[];
    positions: number[];
    normals: number[];
    uvs: number[];
    constructor({ width, height, depth, widthSegments, heightSegments, }?: {
        width?: number | undefined;
        height?: number | undefined;
        depth?: number | undefined;
        widthSegments?: number | undefined;
        heightSegments?: number | undefined;
    });
}
