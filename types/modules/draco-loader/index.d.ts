export default class DracoLoader {
    private _dracoDecoder;
    private _draco;
    private ATTRIB_ID;
    private DATA_TYPE;
    constructor();
    init(): Promise<void>;
    load(url: string): Promise<{}>;
    decodeIndices(draco: any, decoder: any, geometry: any): Uint32Array;
    decodeAttribute(draco: any, decoder: any, geometry: any, key: any, type: any): any;
    decodeBuffer(draco: any, decoder: any, data: any): any;
    decodeDracoGeometry(draco: any, decoder: any, data: any): {};
}
