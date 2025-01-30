import { mat4, vec3 } from "gl-matrix";
import { DrawSet } from "../../";
import Ray from "./Ray";
/**
 * World Axis aligned box
 * Can be used for fast intersection testing
 */
export default class AxisAlignedBox {
    private _max;
    private _min;
    private _center;
    private _extents;
    private _visualiser?;
    /**
     * @param  {vec3} min min bounds vector
     * @param  {vec3} max max bound vector
     */
    constructor(min: vec3, max: vec3);
    _absVector3(vector3: vec3): void;
    /**
     * Creates a mesh wireframe to visualise bounds
     */
    createVisualiser(): void;
    /**
     * Transforms axis-aligned box to new coordinates via a matrix
     * @param  {mat4} matrix transformation matrix
     */
    transform(matrix: mat4): void;
    /**
     * Checks to see if axis-aligned box intersects a given ray
     * @param  {Ray} ray
     * @returns boolean returns true / false based on ray interesection
     */
    intersects(ray: Ray): boolean;
    get min(): vec3;
    set min(value: vec3);
    get max(): vec3;
    set max(value: vec3);
    get center(): vec3;
    set center(value: vec3);
    get visualiser(): DrawSet | undefined;
    set visualiser(value: DrawSet | undefined);
}
