import { vec3 } from "gl-matrix";
import { BoxBounds } from "../../";
/**
 * Represents a Ray vector in 3D space
 */
export default class Ray {
    private _origin;
    private _direction;
    /**
     * Creates a ray given the origin and direction
     * @param  {vec3} origin ray origin
     * @param  {vec3} direction normalized ray direction
     */
    constructor(origin: vec3, direction: vec3);
    /**
     * Return true / false based on intersection with given box bounds
     * @param  {Bounds} bounds min and max values to check for intersection
     */
    intersectsBox(bounds: BoxBounds): boolean;
    /**
     * Determines if the ray intersects the given triangle
     * @param  {vec3} out the out position
     * @param  {vec3[]} tri the triangle to test intersections against
     */
    intersectTriangle(out: vec3, tri: vec3[]): vec3 | null;
    get direction(): vec3;
    set direction(value: vec3);
    get origin(): vec3;
    set origin(value: vec3);
}
