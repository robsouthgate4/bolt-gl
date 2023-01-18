import { mat3, mat4, vec3, vec4 } from "gl-matrix";

import { DrawSet, LINES, Mesh, Program } from "../../";
import helperVertex from "./shaders/helper.vert";
import helperFragment from "./shaders/helper.frag";
import Ray from "./Ray";

/**
 * World Axis aligned box
 * Can be used for fast intersection testing
 */
export default class AxisAlignedBox {
  private _max: vec3;
  private _min: vec3;
  private _center: vec3;
  private _extents: vec3;
  private _visualiser?: DrawSet | undefined;

  /**
   * @param  {vec3} min min bounds vector
   * @param  {vec3} max max bound vector
   */
  constructor(min: vec3, max: vec3) {
    this._min = min;
    this._max = max;

    this._center = vec3.create();
    this._extents = vec3.create();

    vec3.add(this._center, this._min, this._max);
    vec3.multiply(this._center, this._center, vec3.fromValues(0.5, 0.5, 0.5));
    vec3.sub(this._extents, this._max, this._center);

    this._absVector3(this._extents);
  }

  _absVector3(vector3: vec3) {
    vector3[0] = Math.abs(vector3[0]);
    vector3[1] = Math.abs(vector3[1]);
    vector3[2] = Math.abs(vector3[2]);
  }

  /**
   * Creates a mesh wireframe to visualise bounds
   */
  createVisualiser() {
    const mesh = new Mesh({
      indices: [
        0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7,
      ],
      positions: [
        0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5,
        0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5,
      ],
    }).setDrawType(LINES);

    const batch = new DrawSet(mesh, new Program(helperVertex, helperFragment));

    batch.transform.position = this._center;

    this._visualiser = batch;
  }

  /**
   * Transforms axis-aligned box to new coordinates via a matrix
   * @param  {mat4} matrix transformation matrix
   */
  transform(matrix: mat4) {
    // conver mat4 to mat4
    const m = mat3.create();
    mat3.fromMat4(m, matrix);

    const x = vec3.create();
    const y = vec3.create();
    const z = vec3.create();

    const extents = vec3.clone(this._extents);

    vec3.transformMat3(x, vec3.fromValues(extents[0], 0, 0), m);
    vec3.transformMat3(y, vec3.fromValues(0, extents[1], 0), m);
    vec3.transformMat3(z, vec3.fromValues(0, 0, extents[2]), m);

    this._absVector3(x);
    this._absVector3(y);
    this._absVector3(z);

    vec3.add(extents, x, y);
    vec3.add(extents, extents, z);

    this._center = vec3.create();

    const v4 = vec4.fromValues(
      this._center[0],
      this._center[1],
      this._center[2],
      1
    );
    vec4.transformMat4(v4, v4, matrix);

    this._center = vec3.fromValues(v4[0], v4[1], v4[2]);

    this._min = vec3.create();
    this._max = vec3.create();

    // add positinal offsets
    vec3.sub(this._min, this._center, extents);
    vec3.add(this._max, this._center, extents);

    if (this._visualiser) {
      this._visualiser.transform.position = this._center;
      const size = vec3.create();
      vec3.subtract(size, this._min, this._max);
      this._visualiser.transform.scale = size;
    }
  }
  /**
   * Checks to see if axis-aligned box intersects a given ray
   * @param  {Ray} ray
   * @returns boolean returns true / false based on ray interesection
   */
  intersects(ray: Ray): boolean {
    const min = vec3.create();
    const max = vec3.create();

    vec3.sub(min, this._min, ray.origin);
    vec3.div(min, min, ray.direction);

    vec3.sub(max, this._max, ray.origin);
    vec3.div(max, max, ray.direction);

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

  public get min(): vec3 {
    return this._min;
  }

  public set min(value: vec3) {
    this._min = value;
  }

  public get max(): vec3 {
    return this._max;
  }

  public set max(value: vec3) {
    this._max = value;
  }

  public get center(): vec3 {
    return this._center;
  }

  public set center(value: vec3) {
    this._center = value;
  }

  public get visualiser(): DrawSet | undefined {
    return this._visualiser;
  }
  public set visualiser(value: DrawSet | undefined) {
    this._visualiser = value;
  }
}
