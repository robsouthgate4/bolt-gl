import { gunzipSync } from "fflate";

export default class BoltPointCloudLoader {
  private points: Float32Array = new Float32Array();
  private path = "";

  async load(path: string): Promise<void> {
    this.path = path;
    await this.loadData();
  }

  private async loadData(): Promise<void> {
    const pointCloud = await this.loadCompressedBinary(this.path);
    this.points = pointCloud;
  }

  private async loadCompressedBinary(url: string): Promise<Float32Array> {
    //console.log(`Fetching binary file from: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Decompress gzip-compressed binary file
    const buffer = await response.arrayBuffer();
    const compressedData = new Uint8Array(buffer);
    const decompressedData = gunzipSync(compressedData);
    console.log("Decompressed binary data length:", decompressedData.length);

    return this.parseBinary(decompressedData.buffer);
  }

  private parseBinary(buffer: ArrayBuffer): Float32Array {
    const dataView = new DataView(buffer);
    let offset = 0;
    const numPoints = dataView.getUint32(offset, true);
    offset += 4;
    const points = new Float32Array(buffer, offset, numPoints * 3);
    return points;
  }
}
