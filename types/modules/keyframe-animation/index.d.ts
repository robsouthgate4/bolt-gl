import { quat, vec3, vec4 } from "gl-matrix";
import { Channel, KeyFrame } from "../loaders/gltf-loader";
export default class KeyFrameAnimation {
    private _channels;
    private _currentAnimation;
    private _animationTime;
    private _minTime;
    private _maxTime;
    constructor(channels: Channel);
    _setMinAndMaxTime(): void;
    runAnimation(animationName: keyof Channel): void;
    _getKeyFrameTransform(keyframes: KeyFrame[]): Float32Array | [number, number, number] | [number, number, number, number];
    update(elapsed: number, delta: number): void;
    _cubicSplineInterpolate(t: number, prevVal: vec3 | vec4 | quat, prevTan: vec3 | vec4 | quat, nextTan: vec3 | vec4 | quat, nextVal: vec3 | vec4 | quat): vec3 | vec4 | quat;
    _getPrevAndNextKeyFrames(keyFrames: KeyFrame[]): {
        prevKeyFrame: KeyFrame;
        nextKeyFrame: KeyFrame;
    };
}
