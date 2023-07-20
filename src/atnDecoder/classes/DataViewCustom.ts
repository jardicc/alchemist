import { decode } from "iconv-lite/lib/index";
import { charIDToStringID } from "./CharIDToStringID";

export class DataViewCustom extends DataView {
  public offset: number;
  private littleEndian: boolean;

  constructor(
    buffer: ArrayBufferLike | number[],
    littleEndian: boolean,
    byteOffset?: number,
    byteLength?: number,
  ) {
    if (Array.isArray(buffer)) {
      buffer = new Uint8ClampedArray(buffer).buffer;
    }

    super(buffer as ArrayBufferLike, byteOffset, byteLength);
    this.offset = 0;
    this.littleEndian = littleEndian;
  }

  public getBoolean(byteOffset: number = this.offset): boolean {
    const res = this.getUint8(byteOffset);
    //this.offset += 1;
    if (res !== 1 && res !== 0) {
      throw new Error(
        "Wrong value for boolean in ATN parser. Got: " +
          res +
          " instead of 0 or 1",
      );
    }
    return !!res;
  }

  public getUint8(byteOffset: number = this.offset): number {
    const res = super.getUint8(byteOffset);
    this.offset += 1;
    return res;
  }

  public getInt8(byteOffset: number = this.offset): number {
    const res = super.getInt8(byteOffset);
    this.offset += 1;
    return res;
  }

  public getInt16(byteOffset: number = this.offset): number {
    const res = super.getInt16(byteOffset, this.littleEndian);
    this.offset += 2;
    return res;
  }

  public getUint16(
    byteOffset: number = this.offset,
    isLittleEndian = this.littleEndian,
  ): number {
    const res = super.getUint16(byteOffset, isLittleEndian);
    this.offset += 2;
    return res;
  }

  public getInt32(byteOffset: number = this.offset): number {
    const res = super.getInt32(byteOffset, this.littleEndian);
    this.offset += 4;
    return res;
  }

  public getUint32(byteOffset: number = this.offset): number {
    const res = super.getUint32(byteOffset, this.littleEndian);
    this.offset += 4;
    return res;
  }

  /** Will return Int instead of BitInt */
  public getUint64(byteOffset: number = this.offset): number {
    this.offset = byteOffset;
    const lsb = BigInt(
      super.getUint32(
        this.offset + (this.littleEndian ? 0 : 4),
        this.littleEndian,
      ),
    );
    const gsb = BigInt(
      super.getUint32(
        this.offset + (this.littleEndian ? 4 : 0),
        this.littleEndian,
      ),
    );
    const res = Number(lsb + 4294967296n * gsb);
    this.offset += 8;
    return res;
  }

  /** Will return Int instead of BitInt */
  public getInt64(byteOffset: number = this.offset): number {
    this.offset = byteOffset;

    let value = 0n;
    const isNegative =
      (super.getUint8(this.offset + (this.littleEndian ? 7 : 0)) & 0x80) > 0;
    let carrying = true;
    for (let i = 0; i < 8; i++) {
      let byte = super.getUint8(this.offset + (this.littleEndian ? i : 7 - i));
      if (isNegative) {
        if (carrying) {
          if (byte != 0x00) {
            byte = ~(byte - 1) & 0xff;
            carrying = false;
          }
        } else {
          byte = ~byte & 0xff;
        }
      }
      value += BigInt(byte) * 256n ** BigInt(i);
    }
    if (isNegative) {
      value = -value;
    }

    this.offset += 8;
    const res = Number(value);
    return res;
  }

  public getFloat64(byteOffset: number = this.offset): number {
    const res = super.getFloat64(byteOffset, this.littleEndian);
    this.offset += 8;
    return res;
  }

  public getUtf16String(byteOffset: number = this.offset): string {
    this.offset = byteOffset;
    const length = this.getUint32() * 2;
    const sub = new Uint8Array(
      this.buffer.slice(this.offset, this.offset + length - 2),
    );
    const decoded: string = decode(sub as any, "utf16be");
    this.offset += length;
    return decoded;
  }

  public readASCII(byteOffset: number = this.offset, length?: number): string {
    this.offset = byteOffset;
    length = length || this.getUint32();
    const sub = new Uint8Array(
      this.buffer.slice(this.offset, this.offset + length),
    );
    this.offset += length;
    const res = String.fromCharCode.apply(null, sub as any);
    return res;
  }

  public getCommandStringID(byteOffset: number = this.offset): string {
    this.offset = byteOffset;
    const type = this.getUint32();

    if (type === 1413830740) {
      // TEXT
      const res = this.readASCII();
      return res;
    } else if (type === 1819242087) {
      // long
      const legacyCharID = "$" + this.readASCII(undefined, 4);
      return legacyCharID;
    } else {
      throw new Error("Unkown stringID type: " + type);
    }
  }

  public getStringID(byteOffset: number = this.offset): string {
    this.offset = byteOffset;
    const length = this.getUint32();

    if (length === 0) {
      // long
      //console.log(Array.from(new Uint8Array(this.buffer)));
      const sub = new Uint8Array(
        this.buffer.slice(this.offset, this.offset + 4),
      );
      this.offset += 4;
      const id = String.fromCharCode.apply(null, sub as any);
      let s = "";

      if (charIDToStringID[id]) {
        s = charIDToStringID[id];
      } else {
        s = "$" + id;
      }
      return s;
    } else {
      // TEXT
      const res = this.readASCII(undefined, length);
      return res;
    }
  }
}
