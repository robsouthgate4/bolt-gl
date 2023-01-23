import { mat4, vec3 } from "gl-matrix";

import Node from "./Node";

export default class Camera extends Node {
  protected _view: mat4;
  protected _up: vec3;
  protected _projection: mat4;
  protected _forward: vec3;
  protected _projectionView: mat4;
  protected _target = vec3.fromValues(0, 0, 0);
  protected _active: boolean;

  constructor({ position, target }: { position: vec3; target: vec3 }) {
    super();

    this._view = mat4.create();
    this._projection = mat4.create();
    this._projectionView = mat4.create();
    this._up = vec3.fromValues(0, 1, 0);
    this._forward = vec3.fromValues(0, 0, -1);
    this._active = false;
    this._target = target;

    this.name = "Camera";

    this.transform.position = position;
    this.updateModelMatrix();
  }

  update() {
    this.updateModelMatrix();
    mat4.invert(this._view, this.worldMatrix);
    mat4.multiply(this._projectionView, this._projection, this._view);
  }

  public get active(): boolean {
    return this._active;
  }

  public set active(value: boolean) {
    this._active = value;
  }

  public get view(): mat4 {
    return this._view;
  }

  public set view(value: mat4) {
    this._view = value;
  }

  public get position(): vec3 {
    return this.transform.position;
  }

  public set position(value: vec3) {
    this.transform.position = value;
  }

  public get forward(): vec3 {
    return this._forward;
  }

  public set forward(value: vec3) {
    this._forward = value;
  }

  public get projection(): mat4 {
    return this._projection;
  }

  public set projection(value: mat4) {
    this._projection = value;
  }

  public get projectionView(): mat4 {
    return this._projectionView;
  }

  public get target() {
    return this._target;
  }

  public set target(value) {
    this._target = value;
  }

  public get up(): vec3 {
    return this._up;
  }

  public set up(value: vec3) {
    this._up = value;
  }
}
