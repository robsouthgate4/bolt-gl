export default class Clock {
    _autoStart: boolean;
    _startTime: number;
    _oldTime: number;
    _elapsedTime: number;
    _running: boolean;
    constructor(autoStart?: boolean);
    start(): void;
    stop(): void;
    getElapsedTime(): number;
    getDelta(): number;
}
