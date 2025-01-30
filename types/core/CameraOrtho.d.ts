import { vec3 } from "gl-matrix";
import Camera from "./Camera";
export default class CameraOrtho extends Camera {
    private _near;
    private _far;
    private _left;
    private _right;
    private _bottom;
    private _top;
    constructor({ left, right, bottom, top, near, far, position, target, }?: {
        left?: number | undefined;
        right?: number | undefined;
        bottom?: number | undefined;
        top?: number | undefined;
        near?: number | undefined;
        far?: number | undefined;
        position?: vec3 | undefined;
        target?: vec3 | undefined;
    });
    updateProjection(): void;
    lookAt(target: vec3): void;
    update(): void;
    get near(): number;
    set near(value: number);
    get far(): number;
    set far(value: number);
    get left(): number;
    set left(value: number);
    get right(): number;
    set right(value: number);
    get bottom(): number;
    set bottom(value: number);
    get top(): number;
    set top(value: number);
}
