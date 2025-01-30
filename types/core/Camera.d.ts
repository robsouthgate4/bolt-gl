import { mat4, vec3 } from "gl-matrix";
import Node from "./Node";
export default class Camera extends Node {
    protected _view: mat4;
    protected _up: vec3;
    protected _projection: mat4;
    protected _forward: vec3;
    protected _projectionView: mat4;
    protected _target: vec3;
    protected _active: boolean;
    constructor({ position, target }: {
        position: vec3;
        target: vec3;
    });
    update(): void;
    get active(): boolean;
    set active(value: boolean);
    get view(): mat4;
    set view(value: mat4);
    get position(): vec3;
    set position(value: vec3);
    get forward(): vec3;
    set forward(value: vec3);
    get projection(): mat4;
    set projection(value: mat4);
    get projectionView(): mat4;
    get target(): vec3;
    set target(value: vec3);
    get up(): vec3;
    set up(value: vec3);
}
