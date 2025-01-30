import { vec2, vec3, vec4 } from "gl-matrix";
export interface ITouchEvent {
    normalized: {
        x: number;
        y: number;
    };
    raw: {
        x: number;
        y: number;
    };
    rawNormalized: {
        x: number;
        y: number;
    };
}
export interface IUpdateEvent {
    elapsed: number;
    delta: number;
}
export interface IValue {
    value: number | string | boolean | vec2 | vec3 | vec4;
}
export declare type GenericEventData = CustomEvent<IValue>;
export declare type TouchEventData = CustomEvent<ITouchEvent>;
export declare type UpdateEventData = CustomEvent<IUpdateEvent>;
export default class EventListeners {
    static instance: EventListeners;
    private _width;
    private _height;
    private _mouse;
    private _touch?;
    private _target;
    private _boundElement?;
    constructor();
    setBoundElement(el: HTMLElement): void;
    static getInstance(): EventListeners;
    private _createListeners;
    onResize(): void;
    removeListeners(): void;
    onMouse(ev: MouseEvent): void;
    onMouseHold(ev: MouseEvent): void;
    onKeyDown(ev: KeyboardEvent): void;
    onKeyUp(ev: KeyboardEvent): void;
    onMouseEnd(ev: MouseEvent): void;
    onTouch(ev: TouchEvent): void;
    onTouchEnd(ev: TouchEvent): void;
    onWheel(ev: WheelEvent): void;
    onMouseMove(ev: MouseEvent): void;
    onTouchMove(ev: TouchEvent): void;
    publish(topic: string, detail?: any): EventTarget | undefined;
    listen(topic: string, callback: (event: any) => void): EventTarget | undefined;
    getTouch(ev: TouchEvent): {
        normalized: {
            x: number;
            y: number;
        };
        raw: {
            x: number;
            y: number;
        };
        rawNormalized: {
            x: number;
            y: number;
        };
    } | undefined;
    getMouse(ev: MouseEvent): {
        normalized: {
            x: number;
            y: number;
        };
        raw: {
            x: number;
            y: number;
        };
        rawNormalized: {
            x: number;
            y: number;
        };
    };
    get target(): EventTarget;
    set target(value: EventTarget);
}
