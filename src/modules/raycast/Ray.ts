import { vec3 } from "gl-matrix";

import { BoxBounds } from "../../";

const EPSILON = 0.000001;
const edge1 = vec3.fromValues(0, 0, 0);
const edge2 = vec3.fromValues(0, 0, 0);
const tvec = vec3.fromValues(0, 0, 0);
const pvec = vec3.fromValues(0, 0, 0);
const qvec = vec3.fromValues(0, 0, 0);

/**
 * Represents a Ray vector in 3D space
 */
export default class Ray {
  private _origin: vec3;
  private _direction: vec3;

  /**
   * Creates a ray given the origin and direction
   * @param  {vec3} origin ray origin
   * @param  {vec3} direction normalized ray direction
   */
  constructor(origin: vec3, direction: vec3) {
    this._origin = origin;
    this._direction = direction;
  }
  /**
   * Return true / false based on intersection with given box bounds
   * @param  {Bounds} bounds min and max values to check for intersection
   */
  intersectsBox(bounds: BoxBounds) {
    const min = vec3.create();
    const max = vec3.create();

    vec3.sub(min, bounds.min, this._origin);
    vec3.div(min, min, this._direction);

    vec3.sub(max, bounds.max, this._origin);
    vec3.div(max, max, this._direction);

    const fmin = Math.max(
      Math.max(Math.min(min[0], max[0]), Math.min(min[1], max[1])),
      Math.min(min[2], max[2])
    );
    const fmax = Math.min(
      Math.min(Math.max(min[0], max[0]), Math.max(min[1], max[1])),
      Math.max(min[2], max[2])
    );

    return fmax >= fmin;
  }
  /**
   * Determines if the ray intersects the given triangle
   * @param  {vec3} out the out position
   * @param  {vec3[]} tri the triangle to test intersections against
   */
  intersectTriangle(out: vec3, tri: vec3[]) {
    vec3.scale(out, out, 0);

    vec3.sub(edge1, tri[1], tri[0]);
    vec3.sub(edge2, tri[2], tri[0]);

    vec3.cross(pvec, this._direction, edge2);
    const det = vec3.dot(edge1, pvec);

    if (det < EPSILON) return null;

    vec3.sub(tvec, this._origin, tri[0]);

    const u = vec3.dot(tvec, pvec);

    if (u < 0 || u > det) return null;

    vec3.cross(qvec, tvec, edge1);

    const v = vec3.dot(this._direction, qvec);

    if (v < 0 || u + v > det) return null;

    const t = vec3.dot(edge2, qvec) / det;

    out[0] = this._origin[0] + t * this._direction[0];
    out[1] = this._origin[1] + t * this._direction[1];
    out[2] = this._origin[2] + t * this._direction[2];

    return out;
  }

  public get direction(): vec3 {
    return this._direction;
  }

  public set direction(value: vec3) {
    this._direction = value;
  }

  public get origin(): vec3 {
    return this._origin;
  }

  public set origin(value: vec3) {
    this._origin = value;
  }
}
