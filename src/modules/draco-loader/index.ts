// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import { DracoDecoder } from "../draco-decoder";

export default class DracoLoader {
  private _dracoDecoder: DracoDecoder;
  private _draco: any;
  private ATTRIB_ID: { position: any; normal: any; color: any; uv: any };
  // eslint-disable-next-line @typescript-eslint/ban-types
  private DATA_TYPE: {};

  constructor() {
    this.init();
  }

  async init() {
    this._dracoDecoder = new DracoDecoder();

    await this._dracoDecoder.ready();

    this._draco = this._dracoDecoder.module;

    this.DATA_TYPE = {
      [Float32Array]: this._draco.DT_FLOAT32,
      [Int8Array]: this._draco.DT_INT8,
      [Int16Array]: this._draco.DT_INT16,
      [Int32Array]: this._draco.DT_INT32,
      [Uint8Array]: this._draco.DT_UINT8,
      [Uint16Array]: this._draco.DT_UINT16,
      [Uint32Array]: this._draco.DT_UINT32,
    };

    this.ATTRIB_ID = {
      positions: this._draco.POSITION,
      normals: this._draco.NORMAL,
      colors: this._draco.COLOR,
      uvs: this._draco.TEX_COORD,
    };
  }

  public async load(url: string) {
    const response = await fetch(url);

    const arrayBuffer = await response.arrayBuffer();
    const decoder = new this._draco.Decoder();

    const geometry = this.decodeDracoGeometry(
      this._draco,
      decoder,
      arrayBuffer
    );

    return geometry;
  }

  decodeIndices(draco, decoder, geometry) {
    const numFaces = geometry.num_faces();
    const numIndices = numFaces * 3;
    const byteLength = numIndices * 4;

    const ptr = draco._malloc(byteLength);
    decoder.GetTrianglesUInt32Array(geometry, byteLength, ptr);
    const index = new Uint32Array(
      draco.HEAPF32.buffer,
      ptr,
      numIndices
    ).slice();
    draco._free(ptr);

    return index;
  }

  decodeAttribute(draco, decoder, geometry, key, type) {
    const attId = decoder.GetAttributeId(geometry, this.ATTRIB_ID[key]);
    if (attId == -1) return null;

    const attribute = decoder.GetAttribute(geometry, attId);
    const numComponents = attribute.num_components();
    const numPoints = geometry.num_points();
    const numValues = numPoints * numComponents;
    const byteLength = numValues * type.BYTES_PER_ELEMENT;
    const dataType = this.DATA_TYPE[type];

    const ptr = draco._malloc(byteLength);
    decoder.GetAttributeDataArrayForAllPoints(
      geometry,
      attribute,
      dataType,
      byteLength,
      ptr
    );
    const array = new type(draco.HEAPF32.buffer, ptr, numValues).slice();
    draco._free(ptr);

    return array;
  }

  decodeBuffer(draco, decoder, data) {
    const buffer = new draco.DecoderBuffer();
    buffer.Init(new Int8Array(data), data.byteLength);
    const geometryType = decoder.GetEncodedGeometryType(buffer);

    let geometry, status;
    if (geometryType === draco.TRIANGULAR_MESH) {
      geometry = new draco.Mesh();
      status = decoder.DecodeBufferToMesh(buffer, geometry);
    } else if (geometryType === draco.POINT_CLOUD) {
      geometry = new draco.PointCloud();
      status = decoder.DecodeBufferToPointCloud(buffer, geometry);
    } else {
      draco.destroy(decoder);
      draco.destroy(geometry);
      draco.destroy(buffer);
      throw new Error("Unknown geometry type.");
    }

    if (!status.ok() || geometry.ptr === 0) {
      draco.destroy(decoder);
      draco.destroy(geometry);
      draco.destroy(buffer);
      throw new Error("Decoding failed: " + status.error_msg());
    }

    draco.destroy(buffer);
    return geometry;
  }

  decodeDracoGeometry(draco, decoder, data) {
    const geometry = this.decodeBuffer(draco, decoder, data);

    const mesh = {};

    const attribs = {
      positions: Float32Array,
      normals: Float32Array,
      colors: Float32Array,
      uvs: Float32Array,
    };

    for (const key in attribs) {
      mesh[key] = this.decodeAttribute(
        draco,
        decoder,
        geometry,
        key,
        attribs[key]
      );
    }

    mesh["indices"] = this.decodeIndices(draco, decoder, geometry);

    draco.destroy(geometry);
    draco.destroy(decoder);

    return mesh;
  }
}
