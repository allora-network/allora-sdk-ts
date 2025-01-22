// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.3.0
//   protoc               unknown
// source: mint/v4/genesis.proto

/* eslint-disable */
import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import { Params } from "../v1beta1/types";

export const protobufPackage = "mint.v4";

/** GenesisState defines the mint module's genesis state. */
export interface GenesisState {
  /** params defines all the parameters of the module. */
  params?:
    | Params
    | undefined;
  /** previous target emission rewards per unit staked token */
  previousRewardEmissionPerUnitStakedToken: string;
  previousBlockEmission: string;
  /** number of tokens minted into the ecosystem treasury */
  ecosystemTokensMinted: string;
  /** number of months already unlocked for investor token vesting purposes */
  monthsUnlocked: string;
}

function createBaseGenesisState(): GenesisState {
  return {
    params: undefined,
    previousRewardEmissionPerUnitStakedToken: "",
    previousBlockEmission: "",
    ecosystemTokensMinted: "",
    monthsUnlocked: "",
  };
}

export const GenesisState: MessageFns<GenesisState> = {
  encode(message: GenesisState, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(10).fork()).join();
    }
    if (message.previousRewardEmissionPerUnitStakedToken !== "") {
      writer.uint32(18).string(message.previousRewardEmissionPerUnitStakedToken);
    }
    if (message.previousBlockEmission !== "") {
      writer.uint32(26).string(message.previousBlockEmission);
    }
    if (message.ecosystemTokensMinted !== "") {
      writer.uint32(34).string(message.ecosystemTokensMinted);
    }
    if (message.monthsUnlocked !== "") {
      writer.uint32(42).string(message.monthsUnlocked);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): GenesisState {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGenesisState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.params = Params.decode(reader, reader.uint32());
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.previousRewardEmissionPerUnitStakedToken = reader.string();
          continue;
        }
        case 3: {
          if (tag !== 26) {
            break;
          }

          message.previousBlockEmission = reader.string();
          continue;
        }
        case 4: {
          if (tag !== 34) {
            break;
          }

          message.ecosystemTokensMinted = reader.string();
          continue;
        }
        case 5: {
          if (tag !== 42) {
            break;
          }

          message.monthsUnlocked = reader.string();
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

  fromJSON(object: any): GenesisState {
    return {
      params: isSet(object.params) ? Params.fromJSON(object.params) : undefined,
      previousRewardEmissionPerUnitStakedToken: isSet(object.previousRewardEmissionPerUnitStakedToken)
        ? globalThis.String(object.previousRewardEmissionPerUnitStakedToken)
        : "",
      previousBlockEmission: isSet(object.previousBlockEmission) ? globalThis.String(object.previousBlockEmission) : "",
      ecosystemTokensMinted: isSet(object.ecosystemTokensMinted) ? globalThis.String(object.ecosystemTokensMinted) : "",
      monthsUnlocked: isSet(object.monthsUnlocked) ? globalThis.String(object.monthsUnlocked) : "",
    };
  },

  toJSON(message: GenesisState): unknown {
    const obj: any = {};
    if (message.params !== undefined) {
      obj.params = Params.toJSON(message.params);
    }
    if (message.previousRewardEmissionPerUnitStakedToken !== "") {
      obj.previousRewardEmissionPerUnitStakedToken = message.previousRewardEmissionPerUnitStakedToken;
    }
    if (message.previousBlockEmission !== "") {
      obj.previousBlockEmission = message.previousBlockEmission;
    }
    if (message.ecosystemTokensMinted !== "") {
      obj.ecosystemTokensMinted = message.ecosystemTokensMinted;
    }
    if (message.monthsUnlocked !== "") {
      obj.monthsUnlocked = message.monthsUnlocked;
    }
    return obj;
  },

  create(base?: DeepPartial<GenesisState>): GenesisState {
    return GenesisState.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GenesisState>): GenesisState {
    const message = createBaseGenesisState();
    message.params = (object.params !== undefined && object.params !== null)
      ? Params.fromPartial(object.params)
      : undefined;
    message.previousRewardEmissionPerUnitStakedToken = object.previousRewardEmissionPerUnitStakedToken ?? "";
    message.previousBlockEmission = object.previousBlockEmission ?? "";
    message.ecosystemTokensMinted = object.ecosystemTokensMinted ?? "";
    message.monthsUnlocked = object.monthsUnlocked ?? "";
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
