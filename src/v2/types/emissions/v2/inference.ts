// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.3.0
//   protoc               unknown
// source: emissions/v2/inference.proto

/* eslint-disable */
import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";

export const protobufPackage = "emissions.v2";

export interface RegretInformedWeight {
  /** worker who created the value */
  worker: string;
  weight: string;
}

function createBaseRegretInformedWeight(): RegretInformedWeight {
  return { worker: "", weight: "" };
}

export const RegretInformedWeight: MessageFns<RegretInformedWeight> = {
  encode(message: RegretInformedWeight, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.worker !== "") {
      writer.uint32(10).string(message.worker);
    }
    if (message.weight !== "") {
      writer.uint32(18).string(message.weight);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): RegretInformedWeight {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRegretInformedWeight();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.worker = reader.string();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.weight = reader.string();
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

  fromJSON(object: any): RegretInformedWeight {
    return {
      worker: isSet(object.worker) ? globalThis.String(object.worker) : "",
      weight: isSet(object.weight) ? globalThis.String(object.weight) : "",
    };
  },

  toJSON(message: RegretInformedWeight): unknown {
    const obj: any = {};
    if (message.worker !== "") {
      obj.worker = message.worker;
    }
    if (message.weight !== "") {
      obj.weight = message.weight;
    }
    return obj;
  },

  create(base?: DeepPartial<RegretInformedWeight>): RegretInformedWeight {
    return RegretInformedWeight.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<RegretInformedWeight>): RegretInformedWeight {
    const message = createBaseRegretInformedWeight();
    message.worker = object.worker ?? "";
    message.weight = object.weight ?? "";
    return message;
  },
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

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
