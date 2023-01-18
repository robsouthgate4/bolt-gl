// From https://github.com/mrdoob/three.js/blob/dev/src/core/Clock.js
export default class Clock {
  _autoStart: boolean;
  _startTime: number;
  _oldTime: number;
  _elapsedTime: number;
  _running: boolean;

  constructor(autoStart = true) {
    this._autoStart = autoStart;
    this._startTime = 0;
    this._oldTime = 0;
    this._elapsedTime = 0;
    this._running = false;
  }

  start() {
    this._startTime = now();
    this._oldTime = this._startTime;
    this._elapsedTime = 0;
    this._running = true;
  }

  stop() {
    this.getElapsedTime();
    this._running = false;
    this._autoStart = false;
  }

  getElapsedTime() {
    this.getDelta();
    return this._elapsedTime;
  }

  getDelta() {
    let diff = 0;

    if (this._autoStart && !this._running) {
      this.start();
      return 0;
    }

    if (this._running) {
      const newTime = now();

      diff = (newTime - this._oldTime) / 1000;
      this._oldTime = newTime;

      this._elapsedTime += diff;
    }

    return diff;
  }
}

function now() {
  return (typeof performance === "undefined" ? Date : performance).now(); // see #10732
}
