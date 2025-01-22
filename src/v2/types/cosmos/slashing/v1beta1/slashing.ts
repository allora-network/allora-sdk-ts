// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.3.0
//   protoc               unknown
// source: cosmos/slashing/v1beta1/slashing.proto

/* eslint-disable */
import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import { Duration } from "../../../google/protobuf/duration";
import { Timestamp } from "../../../google/protobuf/timestamp";

export const protobufPackage = "cosmos.slashing.v1beta1";

/**
 * ValidatorSigningInfo defines a validator's signing info for monitoring their
 * liveness activity.
 */
export interface ValidatorSigningInfo {
  address: string;
  /** Height at which validator was first a candidate OR was un-jailed */
  startHeight: string;
  /**
   * DEPRECATED: Index which is incremented every time a validator is bonded in a block and
   * _may_ have signed a pre-commit or not. This in conjunction with the
   * signed_blocks_window param determines the index in the missed block bitmap.
   *
   * @deprecated
   */
  indexOffset: string;
  /** Timestamp until which the validator is jailed due to liveness downtime. */
  jailedUntil?:
    | Date
    | undefined;
  /**
   * Whether or not a validator has been tombstoned (killed out of validator
   * set). It is set once the validator commits an equivocation or for any other
   * configured misbehavior.
   */
  tombstoned: boolean;
  /**
   * A counter of missed (unsigned) blocks. It is used to avoid unnecessary
   * reads in the missed block bitmap.
   */
  missedBlocksCounter: string;
}

/** Params represents the parameters used for by the slashing module. */
export interface Params {
  signedBlocksWindow: string;
  minSignedPerWindow: Uint8Array;
  downtimeJailDuration?: Duration | undefined;
  slashFractionDoubleSign: Uint8Array;
  slashFractionDowntime: Uint8Array;
}

function createBaseValidatorSigningInfo(): ValidatorSigningInfo {
  return {
    address: "",
    startHeight: "0",
    indexOffset: "0",
    jailedUntil: undefined,
    tombstoned: false,
    missedBlocksCounter: "0",
  };
}

export const ValidatorSigningInfo: MessageFns<ValidatorSigningInfo> = {
  encode(message: ValidatorSigningInfo, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }
    if (message.startHeight !== "0") {
      writer.uint32(16).int64(message.startHeight);
    }
    if (message.indexOffset !== "0") {
      writer.uint32(24).int64(message.indexOffset);
    }
    if (message.jailedUntil !== undefined) {
      Timestamp.encode(toTimestamp(message.jailedUntil), writer.uint32(34).fork()).join();
    }
    if (message.tombstoned !== false) {
      writer.uint32(40).bool(message.tombstoned);
    }
    if (message.missedBlocksCounter !== "0") {
      writer.uint32(48).int64(message.missedBlocksCounter);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): ValidatorSigningInfo {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseValidatorSigningInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.address = reader.string();
          continue;
        }
        case 2: {
          if (tag !== 16) {
            break;
          }

          message.startHeight = reader.int64().toString();
          continue;
        }
        case 3: {
          if (tag !== 24) {
            break;
          }

          message.indexOffset = reader.int64().toString();
          continue;
        }
        case 4: {
          if (tag !== 34) {
            break;
          }

          message.jailedUntil = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        }
        case 5: {
          if (tag !== 40) {
            break;
          }

          message.tombstoned = reader.bool();
          continue;
        }
        case 6: {
          if (tag !== 48) {
            break;
          }

          message.missedBlocksCounter = reader.int64().toString();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ValidatorSigningInfo {
    return {
      address: isSet(object.address) ? globalThis.String(object.address) : "",
      startHeight: isSet(object.startHeight) ? globalThis.String(object.startHeight) : "0",
      indexOffset: isSet(object.indexOffset) ? globalThis.String(object.indexOffset) : "0",
      jailedUntil: isSet(object.jailedUntil) ? fromJsonTimestamp(object.jailedUntil) : undefined,
      tombstoned: isSet(object.tombstoned) ? globalThis.Boolean(object.tombstoned) : false,
      missedBlocksCounter: isSet(object.missedBlocksCounter) ? globalThis.String(object.missedBlocksCounter) : "0",
    };
  },

  toJSON(message: ValidatorSigningInfo): unknown {
    const obj: any = {};
    if (message.address !== "") {
      obj.address = message.address;
    }
    if (message.startHeight !== "0") {
      obj.startHeight = message.startHeight;
    }
    if (message.indexOffset !== "0") {
      obj.indexOffset = message.indexOffset;
    }
    if (message.jailedUntil !== undefined) {
      obj.jailedUntil = message.jailedUntil.toISOString();
    }
    if (message.tombstoned !== false) {
      obj.tombstoned = message.tombstoned;
    }
    if (message.missedBlocksCounter !== "0") {
      obj.missedBlocksCounter = message.missedBlocksCounter;
    }
    return obj;
  },

  create(base?: DeepPartial<ValidatorSigningInfo>): ValidatorSigningInfo {
    return ValidatorSigningInfo.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ValidatorSigningInfo>): ValidatorSigningInfo {
    const message = createBaseValidatorSigningInfo();
    message.address = object.address ?? "";
    message.startHeight = object.startHeight ?? "0";
    message.indexOffset = object.indexOffset ?? "0";
    message.jailedUntil = object.jailedUntil ?? undefined;
    message.tombstoned = object.tombstoned ?? false;
    message.missedBlocksCounter = object.missedBlocksCounter ?? "0";
    return message;
  },
};

function createBaseParams(): Params {
  return {
    signedBlocksWindow: "0",
    minSignedPerWindow: new Uint8Array(0),
    downtimeJailDuration: undefined,
    slashFractionDoubleSign: new Uint8Array(0),
    slashFractionDowntime: new Uint8Array(0),
  };
}

export const Params: MessageFns<Params> = {
  encode(message: Params, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.signedBlocksWindow !== "0") {
      writer.uint32(8).int64(message.signedBlocksWindow);
    }
    if (message.minSignedPerWindow.length !== 0) {
      writer.uint32(18).bytes(message.minSignedPerWindow);
    }
    if (message.downtimeJailDuration !== undefined) {
      Duration.encode(message.downtimeJailDuration, writer.uint32(26).fork()).join();
    }
    if (message.slashFractionDoubleSign.length !== 0) {
      writer.uint32(34).bytes(message.slashFractionDoubleSign);
    }
    if (message.slashFractionDowntime.length !== 0) {
      writer.uint32(42).bytes(message.slashFractionDowntime);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): Params {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 8) {
            break;
          }

          message.signedBlocksWindow = reader.int64().toString();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.minSignedPerWindow = reader.bytes();
          continue;
        }
        case 3: {
          if (tag !== 26) {
            break;
          }

          message.downtimeJailDuration = Duration.decode(reader, reader.uint32());
          continue;
        }
        case 4: {
          if (tag !== 34) {
            break;
          }

          message.slashFractionDoubleSign = reader.bytes();
          continue;
        }
        case 5: {
          if (tag !== 42) {
            break;
          }

          message.slashFractionDowntime = reader.bytes();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Params {
    return {
      signedBlocksWindow: isSet(object.signedBlocksWindow) ? globalThis.String(object.signedBlocksWindow) : "0",
      minSignedPerWindow: isSet(object.minSignedPerWindow)
        ? bytesFromBase64(object.minSignedPerWindow)
        : new Uint8Array(0),
      downtimeJailDuration: isSet(object.downtimeJailDuration)
        ? Duration.fromJSON(object.downtimeJailDuration)
        : undefined,
      slashFractionDoubleSign: isSet(object.slashFractionDoubleSign)
        ? bytesFromBase64(object.slashFractionDoubleSign)
        : new Uint8Array(0),
      slashFractionDowntime: isSet(object.slashFractionDowntime)
        ? bytesFromBase64(object.slashFractionDowntime)
        : new Uint8Array(0),
    };
  },

  toJSON(message: Params): unknown {
    const obj: any = {};
    if (message.signedBlocksWindow !== "0") {
      obj.signedBlocksWindow = message.signedBlocksWindow;
    }
    if (message.minSignedPerWindow.length !== 0) {
      obj.minSignedPerWindow = base64FromBytes(message.minSignedPerWindow);
    }
    if (message.downtimeJailDuration !== undefined) {
      obj.downtimeJailDuration = Duration.toJSON(message.downtimeJailDuration);
    }
    if (message.slashFractionDoubleSign.length !== 0) {
      obj.slashFractionDoubleSign = base64FromBytes(message.slashFractionDoubleSign);
    }
    if (message.slashFractionDowntime.length !== 0) {
      obj.slashFractionDowntime = base64FromBytes(message.slashFractionDowntime);
    }
    return obj;
  },

  create(base?: DeepPartial<Params>): Params {
    return Params.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Params>): Params {
    const message = createBaseParams();
    message.signedBlocksWindow = object.signedBlocksWindow ?? "0";
    message.minSignedPerWindow = object.minSignedPerWindow ?? new Uint8Array(0);
    message.downtimeJailDuration = (object.downtimeJailDuration !== undefined && object.downtimeJailDuration !== null)
      ? Duration.fromPartial(object.downtimeJailDuration)
      : undefined;
    message.slashFractionDoubleSign = object.slashFractionDoubleSign ?? new Uint8Array(0);
    message.slashFractionDowntime = object.slashFractionDowntime ?? new Uint8Array(0);
    return message;
  },
};

function bytesFromBase64(b64: string): Uint8Array {
  if ((globalThis as any).Buffer) {
    return Uint8Array.from(globalThis.Buffer.from(b64, "base64"));
  } else {
    const bin = globalThis.atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; ++i) {
      arr[i] = bin.charCodeAt(i);
    }
    return arr;
  }
}

function base64FromBytes(arr: Uint8Array): string {
  if ((globalThis as any).Buffer) {
    return globalThis.Buffer.from(arr).toString("base64");
  } else {
    const bin: string[] = [];
    arr.forEach((byte) => {
      bin.push(globalThis.String.fromCharCode(byte));
    });
    return globalThis.btoa(bin.join(""));
  }
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

function toTimestamp(date: Date): Timestamp {
  const seconds = Math.trunc(date.getTime() / 1_000).toString();
  const nanos = (date.getTime() % 1_000) * 1_000_000;
  return { seconds, nanos };
}

function fromTimestamp(t: Timestamp): Date {
  let millis = (globalThis.Number(t.seconds) || 0) * 1_000;
  millis += (t.nanos || 0) / 1_000_000;
  return new globalThis.Date(millis);
}

function fromJsonTimestamp(o: any): Date {
  if (o instanceof globalThis.Date) {
    return o;
  } else if (typeof o === "string") {
    return new globalThis.Date(o);
  } else {
    return fromTimestamp(Timestamp.fromJSON(o));
  }
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}

export interface MessageFns<T> {
  encode(message: T, writer?: BinaryWriter): BinaryWriter;
  decode(input: BinaryReader | Uint8Array, length?: number): T;
  fromJSON(object: any): T;
  toJSON(message: T): unknown;
  create(base?: DeepPartial<T>): T;
  fromPartial(object: DeepPartial<T>): T;
}
