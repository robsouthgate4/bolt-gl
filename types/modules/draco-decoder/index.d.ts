declare class DracoDecoder {
    static instance: DracoDecoder;
    module: any;
    constructor(dracoLib?: any);
    ready(): Promise<void>;
}
export { DracoDecoder };
