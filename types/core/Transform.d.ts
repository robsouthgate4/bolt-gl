import { mat4, vec3, quat } from "gl-matrix";
export default class Transform {
    private _position;
    private _scale;
    private _quaternion;
    private _rotation;
    private _requiresQuatConversion;
    private _lookMat;
    private _vup;
    private _lookMatrix4;
    private _lookTarget;
    private _requiresUpdate;
    constructor();
    updateLocalTransformMatrix(): mat4;
    /**
     * Rotates the current quaternion to look at a point in space
     * @param  {vec3} target position to look at
     */
    lookAt(target: vec3, up?: vec3): void;
    private _onEulerUpdate;
    set positionX(value: number);
    get positionX(): number;
    set positionY(value: number);
    get positionY(): number;
    set positionZ(value: number);
    get positionZ(): number;
    /**
     * @param  {number} value set angle in degrees
     */
    set rotationX(value: number);
    /**
     * @param  {number} value get angle in degrees
     */
    get rotationX(): number;
    /**
     * @param  {number} value set angle in degrees
     */
    set rotationY(value: number);
    /**
     * @param  {number} value get angle in radians
     */
    get rotationY(): number;
    /**
     * @param  {number} value set angle in degrees
     */
    set rotationZ(value: number);
    /**
     * @param  {number} value get angle in degrees
     */
    get rotationZ(): number;
    /**
     * @param  {number} value scale on x axis
     */
    set scaleX(value: number);
    /**
     * @param  {number} value scale on y axis
     */
    set scaleY(value: number);
    /**
     * @param  {number} value scale on z axis
     */
    set scaleZ(value: number);
    /**
     * @param  {number} value angle in radians
     */
    rotateX(value: number): void;
    /**
     * @param  {number} value angle in radians
     */
    rotateY(value: number): void;
    /**
     * @param  {number} value angle in radians
     */
    rotateZ(value: number): void;
    /**
     * Rotate transform around a pivot point
     * @param  {vec3} pivotPoint
     * @param  {vec3} axis
     * @param  {number} angle
     */
    rotateAround(pivotPoint: vec3, axis: vec3, angle: number): void;
    get position(): vec3;
    set position(value: vec3);
    get scale(): vec3;
    set scale(value: vec3);
    get quaternion(): quat;
    set quaternion(value: quat);
    get lookTarget(): vec3;
    set lookTarget(value: vec3);
    get requiresUpdate(): boolean;
    set requiresUpdate(value: boolean);
}
