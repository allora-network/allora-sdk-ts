// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.3.0
//   protoc               unknown
// source: cosmos/store/v1beta1/commit_info.proto

/* eslint-disable */
import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import { Timestamp } from "../../../google/protobuf/timestamp";

export const protobufPackage = "cosmos.store.v1beta1";

/**
 * CommitInfo defines commit information used by the multi-store when committing
 * a version/height.
 *
 * Deprecated: Store v1 is deprecated as of v0.50.x, please use Store v2 types
 * instead.
 *
 * @deprecated
 */
export interface CommitInfo {
  version: string;
  storeInfos: StoreInfo[];
  timestamp?: Date | undefined;
}

/**
 * StoreInfo defines store-specific commit information. It contains a reference
 * between a store name and the commit ID.
 *
 * Deprecated: Store v1 is deprecated as of v0.50.x, please use Store v2 types
 * instead.
 *
 * @deprecated
 */
export interface StoreInfo {
  name: string;
  commitId?: CommitID | undefined;
}

/**
 * CommitID defines the commitment information when a specific store is
 * committed.
 *
 * Deprecated: Store v1 is deprecated as of v0.50.x, please use Store v2 types
 * instead.
 *
 * @deprecated
 */
export interface CommitID {
  version: string;
  hash: Uint8Array;
}

function createBaseCommitInfo(): CommitInfo {
  return { version: "0", storeInfos: [], timestamp: undefined };
}

export const CommitInfo: MessageFns<CommitInfo> = {
  encode(message: CommitInfo, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.version !== "0") {
      writer.uint32(8).int64(message.version);
    }
    for (const v of message.storeInfos) {
      StoreInfo.encode(v!, writer.uint32(18).fork()).join();
    }
    if (message.timestamp !== undefined) {
      Timestamp.encode(toTimestamp(message.timestamp), writer.uint32(26).fork()).join();
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): CommitInfo {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommitInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 8) {
            break;
          }

          message.version = reader.int64().toString();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.storeInfos.push(StoreInfo.decode(reader, reader.uint32()));
          continue;
        }
        case 3: {
          if (tag !== 26) {
            break;
          }

          message.timestamp = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
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

  fromJSON(object: any): CommitInfo {
    return {
      version: isSet(object.version) ? globalThis.String(object.version) : "0",
      storeInfos: globalThis.Array.isArray(object?.storeInfos)
        ? object.storeInfos.map((e: any) => StoreInfo.fromJSON(e))
        : [],
      timestamp: isSet(object.timestamp) ? fromJsonTimestamp(object.timestamp) : undefined,
    };
  },

  toJSON(message: CommitInfo): unknown {
    const obj: any = {};
    if (message.version !== "0") {
      obj.version = message.version;
    }
    if (message.storeInfos?.length) {
      obj.storeInfos = message.storeInfos.map((e) => StoreInfo.toJSON(e));
    }
    if (message.timestamp !== undefined) {
      obj.timestamp = message.timestamp.toISOString();
    }
    return obj;
  },

  create(base?: DeepPartial<CommitInfo>): CommitInfo {
    return CommitInfo.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CommitInfo>): CommitInfo {
    const message = createBaseCommitInfo();
    message.version = object.version ?? "0";
    message.storeInfos = object.storeInfos?.map((e) => StoreInfo.fromPartial(e)) || [];
    message.timestamp = object.timestamp ?? undefined;
    return message;
  },
};

function createBaseStoreInfo(): StoreInfo {
  return { name: "", commitId: undefined };
}

export const StoreInfo: MessageFns<StoreInfo> = {
  encode(message: StoreInfo, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.commitId !== undefined) {
      CommitID.encode(message.commitId, writer.uint32(18).fork()).join();
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): StoreInfo {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStoreInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.name = reader.string();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.commitId = CommitID.decode(reader, reader.uint32());
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

  fromJSON(object: any): StoreInfo {
    return {
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      commitId: isSet(object.commitId) ? CommitID.fromJSON(object.commitId) : undefined,
    };
  },

  toJSON(message: StoreInfo): unknown {
    const obj: any = {};
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.commitId !== undefined) {
      obj.commitId = CommitID.toJSON(message.commitId);
    }
    return obj;
  },

  create(base?: DeepPartial<StoreInfo>): StoreInfo {
    return StoreInfo.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<StoreInfo>): StoreInfo {
    const message = createBaseStoreInfo();
    message.name = object.name ?? "";
    message.commitId = (object.commitId !== undefined && object.commitId !== null)
      ? CommitID.fromPartial(object.commitId)
      : undefined;
    return message;
  },
};

function createBaseCommitID(): CommitID {
  return { version: "0", hash: new Uint8Array(0) };
}

export const CommitID: MessageFns<CommitID> = {
  encode(message: CommitID, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.version !== "0") {
      writer.uint32(8).int64(message.version);
    }
    if (message.hash.length !== 0) {
      writer.uint32(18).bytes(message.hash);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): CommitID {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommitID();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 8) {
            break;
          }

          message.version = reader.int64().toString();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.hash = reader.bytes();
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

  fromJSON(object: any): CommitID {
    return {
      version: isSet(object.version) ? globalThis.String(object.version) : "0",
      hash: isSet(object.hash) ? bytesFromBase64(object.hash) : new Uint8Array(0),
    };
  },

  toJSON(message: CommitID): unknown {
    const obj: any = {};
    if (message.version !== "0") {
      obj.version = message.version;
    }
    if (message.hash.length !== 0) {
      obj.hash = base64FromBytes(message.hash);
    }
    return obj;
  },

  create(base?: DeepPartial<CommitID>): CommitID {
    return CommitID.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CommitID>): CommitID {
    const message = createBaseCommitID();
    message.version = object.version ?? "0";
    message.hash = object.hash ?? new Uint8Array(0);
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
