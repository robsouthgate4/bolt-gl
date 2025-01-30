import { vec3 } from "gl-matrix";
import Camera from "./Camera";
export default class CameraPersp extends Camera {
    private _fov;
    private _near;
    private _far;
    private _aspect;
    constructor({ aspect, fov, near, far, position, target, }?: {
        aspect?: number | undefined;
        fov?: number | undefined;
        near?: number | undefined;
        far?: number | undefined;
        position?: vec3 | undefined;
        target?: vec3 | undefined;
    });
    /**
     * Sets the camera to look at a target point
     * @param  {vec3} target
     */
    lookAt(target: vec3): void;
    /**
     * Updates the camera projection matrix
     * @param  {number} aspect The aspect ratio of the camera
     */
    updateProjection(aspect: number): void;
    /**
     * Get the camera's far plane
     */
    get far(): number;
    /**
     * Set the camera's far plane
     * @param  {number} value
     * @returns void
     *
     */
    set far(value: number);
    get near(): number;
    set near(value: number);
    get fov(): number;
    set fov(value: number);
    get aspect(): number;
    set aspect(value: number);
}
