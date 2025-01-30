export default class Sphere {
    positions: number[];
    indices: number[];
    normals: number[];
    uvs: number[];
    constructor({ radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength, }?: {
        radius?: number | undefined;
        widthSegments?: number | undefined;
        heightSegments?: number | undefined;
        phiStart?: number | undefined;
        phiLength?: number | undefined;
        thetaStart?: number | undefined;
        thetaLength?: number | undefined;
    });
}
