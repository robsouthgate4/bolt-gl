import { mat4, vec3 } from "gl-matrix";

import Camera from "./Camera";

export default class CameraPersp extends Camera {
  private _fov: number;
  private _near: number;
  private _far: number;
  private _aspect: number;

  constructor({
    aspect = 1,
    fov = 45,
    near = 0.1,
    far = 500,
    position = vec3.fromValues(0, 1, 5),
    target = vec3.fromValues(0, 0, 0),
  } = {}) {
    super({ position, target });

    this._fov = fov * (Math.PI / 180);
    this._near = near;
    this._far = far;
    this._aspect = aspect;

    this.lookAt(target);
    this.updateProjection(this._aspect);
    this.update();
  }

  /**
   * @param  {vec3} target
   */
  lookAt(target: vec3) {
    this.transform.lookAt(target);
  }
  /**
   * Updates the camera projection matrix
   * @param  {number} aspect The aspect ratio of the camera
   */
  updateProjection(aspect: number) {
    mat4.perspective(this.projection, this._fov, aspect, this._near, this._far);
    this._aspect = aspect;
  }

  public get far(): number {
    return this._far;
  }
  public set far(value: number) {
    this._far = value;
  }
  public get near(): number {
    return this._near;
  }
  public set near(value: number) {
    this._near = value;
  }
  public get fov(): number {
    return this._fov;
  }
  public set fov(value: number) {
    this._fov = value * (Math.PI / 180);
  }
  public get aspect(): number {
    return this._aspect;
  }
  public set aspect(value: number) {
    this._aspect = value;
  }
}
