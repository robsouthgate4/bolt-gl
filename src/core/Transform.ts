import { mat4, vec3, quat, mat3 } from "gl-matrix";

export default class Transform {
  private _position!: vec3;
  private _scale!: vec3;
  private _quaternion!: quat;
  private _rotation: vec3;
  private _requiresQuatConversion = false;

  // look at function vars
  private _lookMat = mat3.create() as Float32Array;
  // default up vector
  private _vup = vec3.fromValues(0, 1, 0);

  private _lookMatrix4 = mat4.create();
  private _lookTarget = vec3.create();

  private _requiresUpdate: boolean;

  constructor() {
    this._position = vec3.fromValues(0, 0, 0);
    this._quaternion = quat.fromValues(0, 0, 0, 1);
    this._rotation = vec3.fromValues(0, 0, 0);
    this._scale = vec3.fromValues(1, 1, 1);
    this._requiresUpdate = true;
  }

  updateLocalTransformMatrix() {
    const mat = mat4.create();

    if (this._requiresQuatConversion) {
      quat.fromEuler(
        this._quaternion,
        this._rotation[0],
        this._rotation[1],
        this._rotation[2]
      );
    }

    mat4.fromRotationTranslationScale(
      mat,
      this._quaternion,
      this._position,
      this._scale
    );

    this._requiresUpdate = false;

    return mat;
  }
  /**
   * Rotates the current quaternion to look at a point in space
   * @param  {vec3} target position to look at
   */
  lookAt(target: vec3, up?: vec3) {
    mat4.targetTo(this._lookMatrix4, this._position, target, up || this._vup);
    mat3.fromMat4(this._lookMat, this._lookMatrix4);
    quat.fromMat3(this._quaternion, this._lookMat);

    this._lookTarget = target;

    this._requiresUpdate = true;
  }

  private _onEulerUpdate() {
    this._requiresQuatConversion = true;
    this._requiresUpdate = true;
  }

  set positionX(value: number) {
    this._position[0] = value;
    this._requiresUpdate = true;
  }

  get positionX() {
    return this._position[0];
  }

  set positionY(value: number) {
    this._position[1] = value;
    this._requiresUpdate = true;
  }

  get positionY() {
    return this._position[1];
  }

  set positionZ(value: number) {
    this._position[2] = value;
    this._requiresUpdate = true;
  }

  get positionZ() {
    return this._position[2];
  }

  /**
   * @param  {number} value set angle in degrees
   */
  set rotationX(value: number) {
    this._rotation[0] = value;
    this._onEulerUpdate();
  }

  /**
   * @param  {number} value get angle in degrees
   */
  get rotationX() {
    return this._rotation[0];
  }

  /**
   * @param  {number} value set angle in degrees
   */
  set rotationY(value: number) {
    this._rotation[1] = value;
    this._onEulerUpdate();
  }

  /**
   * @param  {number} value get angle in radians
   */
  get rotationY(): number {
    return this._rotation[1];
  }

  /**
   * @param  {number} value set angle in degrees
   */
  set rotationZ(value: number) {
    this._rotation[2] = value;
    this._onEulerUpdate();
  }

  /**
   * @param  {number} value get angle in degrees
   */
  get rotationZ(): number {
    return this._rotation[2];
  }

  /**
   * @param  {number} value scale on x axis
   */
  set scaleX(value: number) {
    this._scale[0] = value;
    this._requiresUpdate = true;
  }

  /**
   * @param  {number} value scale on y axis
   */
  set scaleY(value: number) {
    this._scale[1] = value;
    this._requiresUpdate = true;
  }

  /**
   * @param  {number} value scale on z axis
   */
  set scaleZ(value: number) {
    this._scale[2] = value;
    this._requiresUpdate = true;
  }

  /**
   * @param  {number} value angle in radians
   */
  rotateX(value: number) {
    quat.rotateX(this._quaternion, this._quaternion, value);
    this._requiresUpdate = true;
  }
  /**
   * @param  {number} value angle in radians
   */
  rotateY(value: number) {
    quat.rotateY(this._quaternion, this._quaternion, value);
    this._requiresUpdate = true;
  }
  /**
   * @param  {number} value angle in radians
   */
  rotateZ(value: number) {
    quat.rotateZ(this._quaternion, this._quaternion, value);
    this._requiresUpdate = true;
  }
  /**
   * Rotate transform around a pivot point
   * @param  {vec3} pivotPoint
   * @param  {vec3} axis
   * @param  {number} angle
   */
  rotateAround(pivotPoint: vec3, axis: vec3, angle: number) {
    const rot: quat = quat.create();
    const pos = vec3.clone(this._position);

    quat.setAxisAngle(rot, axis, angle);

    vec3.sub(pos, pos, pivotPoint);
    vec3.add(pos, pos, pivotPoint);

    vec3.transformQuat(pos, pos, rot);
    quat.multiply(this._quaternion, this._quaternion, rot);

    this._position = pos;

    this._requiresUpdate = true;
  }

  public get position(): vec3 {
    return this._position;
  }

  public set position(value: vec3) {
    this._position = value;
    this._requiresUpdate = true;
  }

  public get scale(): vec3 {
    return this._scale;
  }

  public set scale(value: vec3) {
    this._scale = value;
    this._requiresUpdate = true;
  }

  public get quaternion(): quat {
    return this._quaternion;
  }

  public set quaternion(value: quat) {
    this._quaternion = value;
    this._requiresUpdate = true;
  }

  public get lookTarget(): vec3 {
    return this._lookTarget;
  }

  public set lookTarget(value: vec3) {
    this._lookTarget = value;
  }

  public get requiresUpdate(): boolean {
    return this._requiresUpdate;
  }

  public set requiresUpdate(value: boolean) {
    this._requiresUpdate = value;
  }
}
