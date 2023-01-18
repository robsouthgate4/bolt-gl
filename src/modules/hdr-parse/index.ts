/* eslint-disable @typescript-eslint/ban-ts-comment */
//Code ported by Marcin Ignac (2014)
//Based on Java implementation from
//https://code.google.com/r/cys12345-research/source/browse/hdr/image_processor/RGBE.java?r=7d84e9fd866b24079dbe61fa0a966ce8365f5726

//@ts-nocheck
const radiancePattern = "#\\?RADIANCE";
const commentPattern = "#.*";
const exposurePattern = "EXPOSURE=\\s*([0-9]*[.][0-9]*)";
const formatPattern = "FORMAT=32-bit_rle_rgbe";
const widthHeightPattern = "-Y ([0-9]+) \\+X ([0-9]+)";

function readPixelsRawRLE(
  buffer,
  data,
  offset,
  fileOffset,
  scanline_width,
  num_scanlines
) {
  const rgbe = new Array(4);
  let scanline_buffer = null;
  let ptr;
  let ptr_end;
  let count;
  const buf = new Array(2);
  const bufferLength = buffer.length;

  function readBuf(buf) {
    let bytesRead = 0;
    do {
      buf[bytesRead++] = buffer[fileOffset];
    } while (++fileOffset < bufferLength && bytesRead < buf.length);

    return bytesRead;
  }

  function readBufOffset(buf, offset, length) {
    let bytesRead = 0;
    do {
      buf[offset + bytesRead++] = buffer[fileOffset];
    } while (++fileOffset < bufferLength && bytesRead < length);

    return bytesRead;
  }

  function readPixelsRaw(buffer, data, offset, numpixels) {
    const numExpected = 4 * numpixels;
    const numRead = readBufOffset(data, offset, numExpected);
    if (numRead < numExpected) {
      throw new Error(
        "Error reading raw pixels: got " +
          numRead +
          " bytes, expected " +
          numExpected
      );
    }
  }

  while (num_scanlines > 0) {
    if (readBuf(rgbe) < rgbe.length) {
      throw new Error("Error reading bytes: expected " + rgbe.length);
    }

    if (rgbe[0] != 2 || rgbe[1] != 2 || (rgbe[2] & 0x80) != 0) {
      //this file is not run length encoded
      data[offset++] = rgbe[0];
      data[offset++] = rgbe[1];
      data[offset++] = rgbe[2];
      data[offset++] = rgbe[3];
      readPixelsRaw(buffer, data, offset, scanline_width * num_scanlines - 1);
      return;
    }

    if ((((rgbe[2] & 0xff) << 8) | (rgbe[3] & 0xff)) != scanline_width) {
      throw new Error(
        "Wrong scanline width " +
          (((rgbe[2] & 0xff) << 8) | (rgbe[3] & 0xff)) +
          ", expected " +
          scanline_width
      );
    }

    if (scanline_buffer == null) {
      scanline_buffer = new Array(4 * scanline_width);
    }

    ptr = 0;
    /* read each of the four channels for the scanline into the buffer */
    for (let i = 0; i < 4; i++) {
      ptr_end = (i + 1) * scanline_width;
      while (ptr < ptr_end) {
        if (readBuf(buf) < buf.length) {
          throw new Error("Error reading 2-byte buffer");
        }

        if ((buf[0] & 0xff) > 128) {
          /* a run of the same value */
          count = (buf[0] & 0xff) - 128;
          if (count == 0 || count > ptr_end - ptr) {
            throw new Error("Bad scanline data");
          }

          while (count-- > 0) scanline_buffer[ptr++] = buf[1];
        } else {
          /* a non-run */
          count = buf[0] & 0xff;
          if (count == 0 || count > ptr_end - ptr) {
            throw new Error("Bad scanline data");
          }

          scanline_buffer[ptr++] = buf[1];
          if (--count > 0) {
            if (readBufOffset(scanline_buffer, ptr, count) < count) {
              throw new Error("Error reading non-run data");
            }

            ptr += count;
          }
        }
      }
    }

    /* copy byte data to output */
    for (let i = 0; i < scanline_width; i++) {
      data[offset + 0] = scanline_buffer[i];
      data[offset + 1] = scanline_buffer[i + scanline_width];
      data[offset + 2] = scanline_buffer[i + 2 * scanline_width];
      data[offset + 3] = scanline_buffer[i + 3 * scanline_width];
      offset += 4;
    }

    num_scanlines--;
  }
}

//Returns data as floats and flipped along Y by default
export default function parseHdr(buffer) {
  if (buffer instanceof ArrayBuffer) {
    buffer = new Uint8Array(buffer);
  }

  let fileOffset = 0;
  const bufferLength = buffer.length;

  const NEW_LINE = 10;

  function readLine() {
    let buf = "";
    do {
      const b = buffer[fileOffset];
      if (b == NEW_LINE) {
        ++fileOffset;
        break;
      }

      buf += String.fromCharCode(b);
    } while (++fileOffset < bufferLength);

    return buf;
  }

  let width = 0;
  let height = 0;
  let exposure = 1;
  const gamma = 1;
  let rle = false;

  for (let i = 0; i < 20; i++) {
    const line = readLine();
    let match;
    if ((match = line.match(radiancePattern))) {
    } else if ((match = line.match(formatPattern))) {
      rle = true;
    } else if ((match = line.match(exposurePattern))) {
      exposure = Number(match[1]);
    } else if ((match = line.match(commentPattern))) {
    } else if ((match = line.match(widthHeightPattern))) {
      height = Number(match[1]);
      width = Number(match[2]);
      break;
    }
  }

  if (!rle) {
    throw new Error("File is not run length encoded!");
  }

  const data = new Uint8Array(width * height * 4);
  const scanline_width = width;
  const num_scanlines = height;

  readPixelsRawRLE(buffer, data, 0, fileOffset, scanline_width, num_scanlines);

  //TODO: Should be Float16
  const floatData = new Float32Array(width * height * 4);
  for (let offset = 0; offset < data.length; offset += 4) {
    let r = data[offset + 0] / 255;
    let g = data[offset + 1] / 255;
    let b = data[offset + 2] / 255;
    const e = data[offset + 3];
    const f = Math.pow(2.0, e - 128.0);

    r *= f;
    g *= f;
    b *= f;

    const floatOffset = offset;

    floatData[floatOffset + 0] = r;
    floatData[floatOffset + 1] = g;
    floatData[floatOffset + 2] = b;
    floatData[floatOffset + 3] = 1.0;
  }

  return {
    shape: [width, height],
    exposure: exposure,
    gamma: gamma,
    data: floatData,
  };
}
