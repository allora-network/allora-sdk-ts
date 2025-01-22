// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.3.0
//   protoc               unknown
// source: cosmos/feegrant/v1beta1/tx.proto

/* eslint-disable */
import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import { Any } from "../../../google/protobuf/any";

export const protobufPackage = "cosmos.feegrant.v1beta1";

/** Since: cosmos-sdk 0.43 */

/**
 * MsgGrantAllowance adds permission for Grantee to spend up to Allowance
 * of fees from the account of Granter.
 */
export interface MsgGrantAllowance {
  /** granter is the address of the user granting an allowance of their funds. */
  granter: string;
  /** grantee is the address of the user being granted an allowance of another user's funds. */
  grantee: string;
  /** allowance can be any of basic, periodic, allowed fee allowance. */
  allowance?: Any | undefined;
}

/** MsgGrantAllowanceResponse defines the Msg/GrantAllowanceResponse response type. */
export interface MsgGrantAllowanceResponse {
}

/** MsgRevokeAllowance removes any existing Allowance from Granter to Grantee. */
export interface MsgRevokeAllowance {
  /** granter is the address of the user granting an allowance of their funds. */
  granter: string;
  /** grantee is the address of the user being granted an allowance of another user's funds. */
  grantee: string;
}

/** MsgRevokeAllowanceResponse defines the Msg/RevokeAllowanceResponse response type. */
export interface MsgRevokeAllowanceResponse {
}

/**
 * MsgPruneAllowances prunes expired fee allowances.
 *
 * Since cosmos-sdk 0.50
 */
export interface MsgPruneAllowances {
  /** pruner is the address of the user pruning expired allowances. */
  pruner: string;
}

/**
 * MsgPruneAllowancesResponse defines the Msg/PruneAllowancesResponse response type.
 *
 * Since cosmos-sdk 0.50
 */
export interface MsgPruneAllowancesResponse {
}

function createBaseMsgGrantAllowance(): MsgGrantAllowance {
  return { granter: "", grantee: "", allowance: undefined };
}

export const MsgGrantAllowance: MessageFns<MsgGrantAllowance> = {
  encode(message: MsgGrantAllowance, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.granter !== "") {
      writer.uint32(10).string(message.granter);
    }
    if (message.grantee !== "") {
      writer.uint32(18).string(message.grantee);
    }
    if (message.allowance !== undefined) {
      Any.encode(message.allowance, writer.uint32(26).fork()).join();
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): MsgGrantAllowance {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgGrantAllowance();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.granter = reader.string();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.grantee = reader.string();
          continue;
        }
        case 3: {
          if (tag !== 26) {
            break;
          }

          message.allowance = Any.decode(reader, reader.uint32());
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

  fromJSON(object: any): MsgGrantAllowance {
    return {
      granter: isSet(object.granter) ? globalThis.String(object.granter) : "",
      grantee: isSet(object.grantee) ? globalThis.String(object.grantee) : "",
      allowance: isSet(object.allowance) ? Any.fromJSON(object.allowance) : undefined,
    };
  },

  toJSON(message: MsgGrantAllowance): unknown {
    const obj: any = {};
    if (message.granter !== "") {
      obj.granter = message.granter;
    }
    if (message.grantee !== "") {
      obj.grantee = message.grantee;
    }
    if (message.allowance !== undefined) {
      obj.allowance = Any.toJSON(message.allowance);
    }
    return obj;
  },

  create(base?: DeepPartial<MsgGrantAllowance>): MsgGrantAllowance {
    return MsgGrantAllowance.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<MsgGrantAllowance>): MsgGrantAllowance {
    const message = createBaseMsgGrantAllowance();
    message.granter = object.granter ?? "";
    message.grantee = object.grantee ?? "";
    message.allowance = (object.allowance !== undefined && object.allowance !== null)
      ? Any.fromPartial(object.allowance)
      : undefined;
    return message;
  },
};

function createBaseMsgGrantAllowanceResponse(): MsgGrantAllowanceResponse {
  return {};
}

export const MsgGrantAllowanceResponse: MessageFns<MsgGrantAllowanceResponse> = {
  encode(_: MsgGrantAllowanceResponse, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): MsgGrantAllowanceResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgGrantAllowanceResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MsgGrantAllowanceResponse {
    return {};
  },

  toJSON(_: MsgGrantAllowanceResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create(base?: DeepPartial<MsgGrantAllowanceResponse>): MsgGrantAllowanceResponse {
    return MsgGrantAllowanceResponse.fromPartial(base ?? {});
  },
  fromPartial(_: DeepPartial<MsgGrantAllowanceResponse>): MsgGrantAllowanceResponse {
    const message = createBaseMsgGrantAllowanceResponse();
    return message;
  },
};

function createBaseMsgRevokeAllowance(): MsgRevokeAllowance {
  return { granter: "", grantee: "" };
}

export const MsgRevokeAllowance: MessageFns<MsgRevokeAllowance> = {
  encode(message: MsgRevokeAllowance, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.granter !== "") {
      writer.uint32(10).string(message.granter);
    }
    if (message.grantee !== "") {
      writer.uint32(18).string(message.grantee);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): MsgRevokeAllowance {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRevokeAllowance();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.granter = reader.string();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.grantee = reader.string();
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

  fromJSON(object: any): MsgRevokeAllowance {
    return {
      granter: isSet(object.granter) ? globalThis.String(object.granter) : "",
      grantee: isSet(object.grantee) ? globalThis.String(object.grantee) : "",
    };
  },

  toJSON(message: MsgRevokeAllowance): unknown {
    const obj: any = {};
    if (message.granter !== "") {
      obj.granter = message.granter;
    }
    if (message.grantee !== "") {
      obj.grantee = message.grantee;
    }
    return obj;
  },

  create(base?: DeepPartial<MsgRevokeAllowance>): MsgRevokeAllowance {
    return MsgRevokeAllowance.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<MsgRevokeAllowance>): MsgRevokeAllowance {
    const message = createBaseMsgRevokeAllowance();
    message.granter = object.granter ?? "";
    message.grantee = object.grantee ?? "";
    return message;
  },
};

function createBaseMsgRevokeAllowanceResponse(): MsgRevokeAllowanceResponse {
  return {};
}

export const MsgRevokeAllowanceResponse: MessageFns<MsgRevokeAllowanceResponse> = {
  encode(_: MsgRevokeAllowanceResponse, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): MsgRevokeAllowanceResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRevokeAllowanceResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MsgRevokeAllowanceResponse {
    return {};
  },

  toJSON(_: MsgRevokeAllowanceResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create(base?: DeepPartial<MsgRevokeAllowanceResponse>): MsgRevokeAllowanceResponse {
    return MsgRevokeAllowanceResponse.fromPartial(base ?? {});
  },
  fromPartial(_: DeepPartial<MsgRevokeAllowanceResponse>): MsgRevokeAllowanceResponse {
    const message = createBaseMsgRevokeAllowanceResponse();
    return message;
  },
};

function createBaseMsgPruneAllowances(): MsgPruneAllowances {
  return { pruner: "" };
}

export const MsgPruneAllowances: MessageFns<MsgPruneAllowances> = {
  encode(message: MsgPruneAllowances, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.pruner !== "") {
      writer.uint32(10).string(message.pruner);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): MsgPruneAllowances {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgPruneAllowances();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.pruner = reader.string();
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

  fromJSON(object: any): MsgPruneAllowances {
    return { pruner: isSet(object.pruner) ? globalThis.String(object.pruner) : "" };
  },

  toJSON(message: MsgPruneAllowances): unknown {
    const obj: any = {};
    if (message.pruner !== "") {
      obj.pruner = message.pruner;
    }
    return obj;
  },

  create(base?: DeepPartial<MsgPruneAllowances>): MsgPruneAllowances {
    return MsgPruneAllowances.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<MsgPruneAllowances>): MsgPruneAllowances {
    const message = createBaseMsgPruneAllowances();
    message.pruner = object.pruner ?? "";
    return message;
  },
};

function createBaseMsgPruneAllowancesResponse(): MsgPruneAllowancesResponse {
  return {};
}

export const MsgPruneAllowancesResponse: MessageFns<MsgPruneAllowancesResponse> = {
  encode(_: MsgPruneAllowancesResponse, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): MsgPruneAllowancesResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgPruneAllowancesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MsgPruneAllowancesResponse {
    return {};
  },

  toJSON(_: MsgPruneAllowancesResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create(base?: DeepPartial<MsgPruneAllowancesResponse>): MsgPruneAllowancesResponse {
    return MsgPruneAllowancesResponse.fromPartial(base ?? {});
  },
  fromPartial(_: DeepPartial<MsgPruneAllowancesResponse>): MsgPruneAllowancesResponse {
    const message = createBaseMsgPruneAllowancesResponse();
    return message;
  },
};

/** Msg defines the feegrant msg service. */
export interface Msg {
  /**
   * GrantAllowance grants fee allowance to the grantee on the granter's
   * account with the provided expiration time.
   */
  GrantAllowance(request: MsgGrantAllowance): Promise<MsgGrantAllowanceResponse>;
  /**
   * RevokeAllowance revokes any fee allowance of granter's account that
   * has been granted to the grantee.
   */
  RevokeAllowance(request: MsgRevokeAllowance): Promise<MsgRevokeAllowanceResponse>;
  /**
   * PruneAllowances prunes expired fee allowances, currently up to 75 at a time.
   *
   * Since cosmos-sdk 0.50
   */
  PruneAllowances(request: MsgPruneAllowances): Promise<MsgPruneAllowancesResponse>;
}

export const MsgServiceName = "cosmos.feegrant.v1beta1.Msg";
export class MsgClientImpl implements Msg {
  private readonly rpc: Rpc;
  private readonly service: string;
  constructor(rpc: Rpc, opts?: { service?: string }) {
    this.service = opts?.service || MsgServiceName;
    this.rpc = rpc;
    this.GrantAllowance = this.GrantAllowance.bind(this);
    this.RevokeAllowance = this.RevokeAllowance.bind(this);
    this.PruneAllowances = this.PruneAllowances.bind(this);
  }
  GrantAllowance(request: MsgGrantAllowance): Promise<MsgGrantAllowanceResponse> {
    const data = MsgGrantAllowance.encode(request).finish();
    const promise = this.rpc.request(this.service, "GrantAllowance", data);
    return promise.then((data) => MsgGrantAllowanceResponse.decode(new BinaryReader(data)));
  }

  RevokeAllowance(request: MsgRevokeAllowance): Promise<MsgRevokeAllowanceResponse> {
    const data = MsgRevokeAllowance.encode(request).finish();
    const promise = this.rpc.request(this.service, "RevokeAllowance", data);
    return promise.then((data) => MsgRevokeAllowanceResponse.decode(new BinaryReader(data)));
  }

  PruneAllowances(request: MsgPruneAllowances): Promise<MsgPruneAllowancesResponse> {
    const data = MsgPruneAllowances.encode(request).finish();
    const promise = this.rpc.request(this.service, "PruneAllowances", data);
    return promise.then((data) => MsgPruneAllowancesResponse.decode(new BinaryReader(data)));
  }
}

interface Rpc {
  request(service: string, method: string, data: Uint8Array): Promise<Uint8Array>;
}

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
