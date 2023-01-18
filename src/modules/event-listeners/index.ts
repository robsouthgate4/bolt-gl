import { vec2, vec3, vec4 } from "gl-matrix";

import {
  GL_WHEEL_TOPIC,
  GL_TOUCH_END_TOPIC,
  GL_TOUCH_MOVE_TOPIC,
  GL_TOUCH_START_TOPIC,
  GL_RESIZE_TOPIC,
  GL_KEYDOWN_TOPIC,
  GL_KEYUP_TOPIC,
  GL_TOUCH_HOLD_TOPIC,
} from "./constants";

const isTouchDevice = () => {
  return navigator
    ? "ontouchstart" in window ||
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        (window.DocumentTouch && document instanceof window.DocumentTouch) ||
        navigator.maxTouchPoints ||
        false
    : false;
};

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

export type GenericEventData = CustomEvent<IValue>;
export type TouchEventData = CustomEvent<ITouchEvent>;
export type UpdateEventData = CustomEvent<IUpdateEvent>;

export default class EventListeners {
  static instance: EventListeners;

  private _width: number;
  private _height: number;
  private _mouse: ITouchEvent | null;
  private _touch?: ITouchEvent | null;
  private _target = new EventTarget();
  private _boundElement?: HTMLElement;

  constructor() {
    this._mouse = null;
    this._touch = null;
    this._width = window.innerWidth;
    this._height = window.innerHeight;
    this._boundElement = undefined;
  }

  setBoundElement(el: HTMLElement) {
    this._boundElement = el;
    this._createListeners();
  }

  static getInstance() {
    if (!EventListeners.instance) EventListeners.instance = new this();
    return EventListeners.instance;
  }

  private _createListeners() {
    if (!this._boundElement) return;
    this.onResize();
    window.addEventListener("resize", this.onResize.bind(this));

    let timer: ReturnType<typeof setTimeout>;
    this._boundElement.addEventListener("mousedown", (e) => {
      timer = setTimeout(() => {
        this.onMouseHold(e);
      }, 50);
    });

    this._boundElement.addEventListener("mouseup", () => {
      clearTimeout(timer);
    });

    if (isTouchDevice()) {
      this._boundElement.addEventListener(
        "touchstart",
        this.onTouch.bind(this),
        { passive: true }
      );
      this._boundElement.addEventListener(
        "touchend",
        this.onTouchEnd.bind(this),
        { passive: true }
      );
      this._boundElement.addEventListener(
        "touchmove",
        this.onTouchMove.bind(this),
        { passive: true }
      );
    } else {
      this._boundElement.addEventListener("mousedown", this.onMouse.bind(this));
      this._boundElement.addEventListener(
        "mouseup",
        this.onMouseEnd.bind(this)
      );
      this._boundElement.addEventListener(
        "mousemove",
        this.onMouseMove.bind(this)
      );
      this._boundElement.addEventListener("wheel", this.onWheel.bind(this), {
        passive: true,
      });
      window.addEventListener("keydown", this.onKeyDown.bind(this));
      window.addEventListener("keyup", this.onKeyUp.bind(this));
    }
  }

  onResize() {
    this._width = window.innerWidth;
    this._height = window.innerHeight;
    this.publish(GL_RESIZE_TOPIC, { width: this._width, height: this._height });
  }

  removeListeners() {
    if (!this._boundElement) return;
    this._boundElement.removeEventListener(
      "touchstart",
      this.onTouch.bind(this)
    );
    this._boundElement.removeEventListener(
      "touchend",
      this.onTouchEnd.bind(this)
    );
    this._boundElement.removeEventListener(
      "touchmove",
      this.onTouchMove.bind(this)
    );
    this._boundElement.removeEventListener(
      "mousedown",
      this.onMouse.bind(this)
    );
    this._boundElement.removeEventListener(
      "mouseup",
      this.onMouseEnd.bind(this)
    );
    this._boundElement.removeEventListener(
      "mousemove",
      this.onMouseMove.bind(this)
    );
    this._boundElement.removeEventListener("wheel", this.onWheel.bind(this));
    window.removeEventListener("keydown", this.onKeyDown.bind(this));
    window.removeEventListener("keyup", this.onKeyUp.bind(this));
  }

  onMouse(ev: MouseEvent) {
    this._mouse = this.getMouse(ev);
    this.publish(GL_TOUCH_START_TOPIC, this._mouse);
  }

  onMouseHold(ev: MouseEvent) {
    this._mouse = this.getMouse(ev);
    this.publish(GL_TOUCH_HOLD_TOPIC, this._mouse);
  }

  onKeyDown(ev: KeyboardEvent) {
    this.publish(GL_KEYDOWN_TOPIC, ev);
  }

  onKeyUp(ev: KeyboardEvent) {
    this.publish(GL_KEYUP_TOPIC, ev);
  }

  onMouseEnd(ev: MouseEvent) {
    this._mouse = this.getMouse(ev);
    this.publish(GL_TOUCH_END_TOPIC, this._mouse);
  }

  onTouch(ev: TouchEvent) {
    this._touch = this.getTouch(ev);
    this.publish(GL_TOUCH_START_TOPIC, this._touch);
  }

  onTouchEnd(ev: TouchEvent) {
    this._touch = this.getTouch(ev);
    this.publish(GL_TOUCH_END_TOPIC, this._touch);
  }

  onWheel(ev: WheelEvent) {
    this.publish(GL_WHEEL_TOPIC, ev);
  }

  onMouseMove(ev: MouseEvent) {
    ev.preventDefault();
    ev.stopPropagation();

    this._mouse = this.getMouse(ev);
    this.publish(GL_TOUCH_MOVE_TOPIC, this._mouse);
  }

  onTouchMove(ev: TouchEvent) {
    if (ev.touches) {
      if (ev.touches.length > 1) {
        return;
      }
    }

    ev.stopPropagation();

    this._touch = this.getTouch(ev);
    if (!this._touch) return;
    this.publish(GL_TOUCH_MOVE_TOPIC, this._touch);
  }

  publish(topic: string, detail?: any) {
    if (!this._target) return;
    this._target.dispatchEvent(new CustomEvent(topic, { detail }));
    return this._target;
  }

  listen(topic: string, callback: (event: any) => void) {
    if (!this._target) return;
    this._target.addEventListener(topic, callback as EventListener);
    return this._target;
  }

  getTouch(ev: TouchEvent) {
    if (!ev.changedTouches.length) return;
    const event = ev.changedTouches[0];
    return {
      normalized: {
        x: (event.clientX / this._width) * 2 - 1,
        y: -(event.clientY / this._height) * 2 + 1,
      },
      raw: {
        x: event.clientX,
        y: event.clientY,
      },
      rawNormalized: {
        x: (event.clientX - this._width * 0.5) * 2,
        y: (event.clientY - this._height * 0.5) * 2,
      },
    };
  }

  getMouse(ev: MouseEvent) {
    return {
      normalized: {
        x: (ev.clientX / this._width) * 2 - 1,
        y: -(ev.clientY / this._height) * 2 + 1,
      },
      raw: {
        x: ev.clientX,
        y: ev.clientY,
      },
      rawNormalized: {
        x: (ev.clientX - this._width * 0.5) * 2,
        y: (ev.clientY - this._height * 0.5) * 2,
      },
    };
  }

  public get target() {
    return this._target;
  }
  public set target(value) {
    this._target = value;
  }
}
