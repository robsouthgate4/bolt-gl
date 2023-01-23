import { mat4, vec3 } from "gl-matrix";

import Camera from "./Camera";

export default class CameraOrtho extends Camera {
  private _near: number;
  private _far: number;
  private _left: number;
  private _right: number;
  private _bottom: number;
  private _top: number;

  constructor({
    left = 0,
    right = 1000,
    bottom = 1000,
    top = 0,
    near = 400,
    far = -400,
    position = vec3.fromValues(0, 1, 5),
    target = vec3.fromValues(0, 0, 0),
  } = {}) {
    super({ position, target });

    this.target = target;
    this._near = near;
    this._far = far;

    this._left = left;
    this._right = right;
    this._bottom = bottom;
    this._top = top;

    this.position = position;
    this.up = vec3.fromValues(0, 1, 0);
    this.forward = vec3.fromValues(0, 0, -1);

    this.updateProjection();
    this.update();
  }

  updateProjection() {
    mat4.ortho(
      this._projection,
      this._left,
      this._right,
      this._bottom,
      this._top,
      this._near,
      this._far
    );
  }

  lookAt(target: vec3) {
    vec3.copy(this.target, target);
  }

  update() {
    mat4.lookAt(this._view, this.position, this.target, this.up);
  }

  public get near(): number {
    return this._near;
  }

  public set near(value: number) {
    this._near = value;
  }

  public get far(): number {
    return this._far;
  }

  public set far(value: number) {
    this._far = value;
  }

  public get left(): number {
    return this._left;
  }

  public set left(value: number) {
    this._left = value;
  }

  public get right(): number {
    return this._right;
  }

  public set right(value: number) {
    this._right = value;
  }

  public get bottom(): number {
    return this._bottom;
  }

  public set bottom(value: number) {
    this._bottom = value;
  }

  public get top(): number {
    return this._top;
  }

  public set top(value: number) {
    this._top = value;
  }
}
