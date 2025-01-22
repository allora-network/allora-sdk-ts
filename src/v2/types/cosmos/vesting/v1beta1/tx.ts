// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.3.0
//   protoc               unknown
// source: cosmos/vesting/v1beta1/tx.proto

/* eslint-disable */
import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import { Coin } from "../../base/v1beta1/coin";
import { Period } from "./vesting";

export const protobufPackage = "cosmos.vesting.v1beta1";

/**
 * MsgCreateVestingAccount defines a message that enables creating a vesting
 * account.
 */
export interface MsgCreateVestingAccount {
  fromAddress: string;
  toAddress: string;
  amount: Coin[];
  /** end of vesting as unix time (in seconds). */
  endTime: string;
  delayed: boolean;
  /**
   * start of vesting as unix time (in seconds).
   *
   * Since 0.51.x
   */
  startTime: string;
}

/** MsgCreateVestingAccountResponse defines the Msg/CreateVestingAccount response type. */
export interface MsgCreateVestingAccountResponse {
}

/**
 * MsgCreatePermanentLockedAccount defines a message that enables creating a permanent
 * locked account.
 *
 * Since: cosmos-sdk 0.46
 */
export interface MsgCreatePermanentLockedAccount {
  fromAddress: string;
  toAddress: string;
  amount: Coin[];
}

/**
 * MsgCreatePermanentLockedAccountResponse defines the Msg/CreatePermanentLockedAccount response type.
 *
 * Since: cosmos-sdk 0.46
 */
export interface MsgCreatePermanentLockedAccountResponse {
}

/**
 * MsgCreateVestingAccount defines a message that enables creating a vesting
 * account.
 *
 * Since: cosmos-sdk 0.46
 */
export interface MsgCreatePeriodicVestingAccount {
  fromAddress: string;
  toAddress: string;
  /** start of vesting as unix time (in seconds). */
  startTime: string;
  vestingPeriods: Period[];
}

/**
 * MsgCreateVestingAccountResponse defines the Msg/CreatePeriodicVestingAccount
 * response type.
 *
 * Since: cosmos-sdk 0.46
 */
export interface MsgCreatePeriodicVestingAccountResponse {
}

function createBaseMsgCreateVestingAccount(): MsgCreateVestingAccount {
  return { fromAddress: "", toAddress: "", amount: [], endTime: "0", delayed: false, startTime: "0" };
}

export const MsgCreateVestingAccount: MessageFns<MsgCreateVestingAccount> = {
  encode(message: MsgCreateVestingAccount, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.fromAddress !== "") {
      writer.uint32(10).string(message.fromAddress);
    }
    if (message.toAddress !== "") {
      writer.uint32(18).string(message.toAddress);
    }
    for (const v of message.amount) {
      Coin.encode(v!, writer.uint32(26).fork()).join();
    }
    if (message.endTime !== "0") {
      writer.uint32(32).int64(message.endTime);
    }
    if (message.delayed !== false) {
      writer.uint32(40).bool(message.delayed);
    }
    if (message.startTime !== "0") {
      writer.uint32(48).int64(message.startTime);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): MsgCreateVestingAccount {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateVestingAccount();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.fromAddress = reader.string();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.toAddress = reader.string();
          continue;
        }
        case 3: {
          if (tag !== 26) {
            break;
          }

          message.amount.push(Coin.decode(reader, reader.uint32()));
          continue;
        }
        case 4: {
          if (tag !== 32) {
            break;
          }

          message.endTime = reader.int64().toString();
          continue;
        }
        case 5: {
          if (tag !== 40) {
            break;
          }

          message.delayed = reader.bool();
          continue;
        }
        case 6: {
          if (tag !== 48) {
            break;
          }

          message.startTime = reader.int64().toString();
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

  fromJSON(object: any): MsgCreateVestingAccount {
    return {
      fromAddress: isSet(object.fromAddress) ? globalThis.String(object.fromAddress) : "",
      toAddress: isSet(object.toAddress) ? globalThis.String(object.toAddress) : "",
      amount: globalThis.Array.isArray(object?.amount) ? object.amount.map((e: any) => Coin.fromJSON(e)) : [],
      endTime: isSet(object.endTime) ? globalThis.String(object.endTime) : "0",
      delayed: isSet(object.delayed) ? globalThis.Boolean(object.delayed) : false,
      startTime: isSet(object.startTime) ? globalThis.String(object.startTime) : "0",
    };
  },

  toJSON(message: MsgCreateVestingAccount): unknown {
    const obj: any = {};
    if (message.fromAddress !== "") {
      obj.fromAddress = message.fromAddress;
    }
    if (message.toAddress !== "") {
      obj.toAddress = message.toAddress;
    }
    if (message.amount?.length) {
      obj.amount = message.amount.map((e) => Coin.toJSON(e));
    }
    if (message.endTime !== "0") {
      obj.endTime = message.endTime;
    }
    if (message.delayed !== false) {
      obj.delayed = message.delayed;
    }
    if (message.startTime !== "0") {
      obj.startTime = message.startTime;
    }
    return obj;
  },

  create(base?: DeepPartial<MsgCreateVestingAccount>): MsgCreateVestingAccount {
    return MsgCreateVestingAccount.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<MsgCreateVestingAccount>): MsgCreateVestingAccount {
    const message = createBaseMsgCreateVestingAccount();
    message.fromAddress = object.fromAddress ?? "";
    message.toAddress = object.toAddress ?? "";
    message.amount = object.amount?.map((e) => Coin.fromPartial(e)) || [];
    message.endTime = object.endTime ?? "0";
    message.delayed = object.delayed ?? false;
    message.startTime = object.startTime ?? "0";
    return message;
  },
};

function createBaseMsgCreateVestingAccountResponse(): MsgCreateVestingAccountResponse {
  return {};
}

export const MsgCreateVestingAccountResponse: MessageFns<MsgCreateVestingAccountResponse> = {
  encode(_: MsgCreateVestingAccountResponse, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): MsgCreateVestingAccountResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateVestingAccountResponse();
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

  fromJSON(_: any): MsgCreateVestingAccountResponse {
    return {};
  },

  toJSON(_: MsgCreateVestingAccountResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create(base?: DeepPartial<MsgCreateVestingAccountResponse>): MsgCreateVestingAccountResponse {
    return MsgCreateVestingAccountResponse.fromPartial(base ?? {});
  },
  fromPartial(_: DeepPartial<MsgCreateVestingAccountResponse>): MsgCreateVestingAccountResponse {
    const message = createBaseMsgCreateVestingAccountResponse();
    return message;
  },
};

function createBaseMsgCreatePermanentLockedAccount(): MsgCreatePermanentLockedAccount {
  return { fromAddress: "", toAddress: "", amount: [] };
}

export const MsgCreatePermanentLockedAccount: MessageFns<MsgCreatePermanentLockedAccount> = {
  encode(message: MsgCreatePermanentLockedAccount, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.fromAddress !== "") {
      writer.uint32(10).string(message.fromAddress);
    }
    if (message.toAddress !== "") {
      writer.uint32(18).string(message.toAddress);
    }
    for (const v of message.amount) {
      Coin.encode(v!, writer.uint32(26).fork()).join();
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): MsgCreatePermanentLockedAccount {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreatePermanentLockedAccount();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.fromAddress = reader.string();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.toAddress = reader.string();
          continue;
        }
        case 3: {
          if (tag !== 26) {
            break;
          }

          message.amount.push(Coin.decode(reader, reader.uint32()));
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

  fromJSON(object: any): MsgCreatePermanentLockedAccount {
    return {
      fromAddress: isSet(object.fromAddress) ? globalThis.String(object.fromAddress) : "",
      toAddress: isSet(object.toAddress) ? globalThis.String(object.toAddress) : "",
      amount: globalThis.Array.isArray(object?.amount) ? object.amount.map((e: any) => Coin.fromJSON(e)) : [],
    };
  },

  toJSON(message: MsgCreatePermanentLockedAccount): unknown {
    const obj: any = {};
    if (message.fromAddress !== "") {
      obj.fromAddress = message.fromAddress;
    }
    if (message.toAddress !== "") {
      obj.toAddress = message.toAddress;
    }
    if (message.amount?.length) {
      obj.amount = message.amount.map((e) => Coin.toJSON(e));
    }
    return obj;
  },

  create(base?: DeepPartial<MsgCreatePermanentLockedAccount>): MsgCreatePermanentLockedAccount {
    return MsgCreatePermanentLockedAccount.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<MsgCreatePermanentLockedAccount>): MsgCreatePermanentLockedAccount {
    const message = createBaseMsgCreatePermanentLockedAccount();
    message.fromAddress = object.fromAddress ?? "";
    message.toAddress = object.toAddress ?? "";
    message.amount = object.amount?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
};

function createBaseMsgCreatePermanentLockedAccountResponse(): MsgCreatePermanentLockedAccountResponse {
  return {};
}

export const MsgCreatePermanentLockedAccountResponse: MessageFns<MsgCreatePermanentLockedAccountResponse> = {
  encode(_: MsgCreatePermanentLockedAccountResponse, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): MsgCreatePermanentLockedAccountResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreatePermanentLockedAccountResponse();
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

  fromJSON(_: any): MsgCreatePermanentLockedAccountResponse {
    return {};
  },

  toJSON(_: MsgCreatePermanentLockedAccountResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create(base?: DeepPartial<MsgCreatePermanentLockedAccountResponse>): MsgCreatePermanentLockedAccountResponse {
    return MsgCreatePermanentLockedAccountResponse.fromPartial(base ?? {});
  },
  fromPartial(_: DeepPartial<MsgCreatePermanentLockedAccountResponse>): MsgCreatePermanentLockedAccountResponse {
    const message = createBaseMsgCreatePermanentLockedAccountResponse();
    return message;
  },
};

function createBaseMsgCreatePeriodicVestingAccount(): MsgCreatePeriodicVestingAccount {
  return { fromAddress: "", toAddress: "", startTime: "0", vestingPeriods: [] };
}

export const MsgCreatePeriodicVestingAccount: MessageFns<MsgCreatePeriodicVestingAccount> = {
  encode(message: MsgCreatePeriodicVestingAccount, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.fromAddress !== "") {
      writer.uint32(10).string(message.fromAddress);
    }
    if (message.toAddress !== "") {
      writer.uint32(18).string(message.toAddress);
    }
    if (message.startTime !== "0") {
      writer.uint32(24).int64(message.startTime);
    }
    for (const v of message.vestingPeriods) {
      Period.encode(v!, writer.uint32(34).fork()).join();
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): MsgCreatePeriodicVestingAccount {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreatePeriodicVestingAccount();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.fromAddress = reader.string();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.toAddress = reader.string();
          continue;
        }
        case 3: {
          if (tag !== 24) {
            break;
          }

          message.startTime = reader.int64().toString();
          continue;
        }
        case 4: {
          if (tag !== 34) {
            break;
          }

          message.vestingPeriods.push(Period.decode(reader, reader.uint32()));
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

  fromJSON(object: any): MsgCreatePeriodicVestingAccount {
    return {
      fromAddress: isSet(object.fromAddress) ? globalThis.String(object.fromAddress) : "",
      toAddress: isSet(object.toAddress) ? globalThis.String(object.toAddress) : "",
      startTime: isSet(object.startTime) ? globalThis.String(object.startTime) : "0",
      vestingPeriods: globalThis.Array.isArray(object?.vestingPeriods)
        ? object.vestingPeriods.map((e: any) => Period.fromJSON(e))
        : [],
    };
  },

  toJSON(message: MsgCreatePeriodicVestingAccount): unknown {
    const obj: any = {};
    if (message.fromAddress !== "") {
      obj.fromAddress = message.fromAddress;
    }
    if (message.toAddress !== "") {
      obj.toAddress = message.toAddress;
    }
    if (message.startTime !== "0") {
      obj.startTime = message.startTime;
    }
    if (message.vestingPeriods?.length) {
      obj.vestingPeriods = message.vestingPeriods.map((e) => Period.toJSON(e));
    }
    return obj;
  },

  create(base?: DeepPartial<MsgCreatePeriodicVestingAccount>): MsgCreatePeriodicVestingAccount {
    return MsgCreatePeriodicVestingAccount.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<MsgCreatePeriodicVestingAccount>): MsgCreatePeriodicVestingAccount {
    const message = createBaseMsgCreatePeriodicVestingAccount();
    message.fromAddress = object.fromAddress ?? "";
    message.toAddress = object.toAddress ?? "";
    message.startTime = object.startTime ?? "0";
    message.vestingPeriods = object.vestingPeriods?.map((e) => Period.fromPartial(e)) || [];
    return message;
  },
};

function createBaseMsgCreatePeriodicVestingAccountResponse(): MsgCreatePeriodicVestingAccountResponse {
  return {};
}

export const MsgCreatePeriodicVestingAccountResponse: MessageFns<MsgCreatePeriodicVestingAccountResponse> = {
  encode(_: MsgCreatePeriodicVestingAccountResponse, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): MsgCreatePeriodicVestingAccountResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreatePeriodicVestingAccountResponse();
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

  fromJSON(_: any): MsgCreatePeriodicVestingAccountResponse {
    return {};
  },

  toJSON(_: MsgCreatePeriodicVestingAccountResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create(base?: DeepPartial<MsgCreatePeriodicVestingAccountResponse>): MsgCreatePeriodicVestingAccountResponse {
    return MsgCreatePeriodicVestingAccountResponse.fromPartial(base ?? {});
  },
  fromPartial(_: DeepPartial<MsgCreatePeriodicVestingAccountResponse>): MsgCreatePeriodicVestingAccountResponse {
    const message = createBaseMsgCreatePeriodicVestingAccountResponse();
    return message;
  },
};

/** Msg defines the bank Msg service. */
export interface Msg {
  /**
   * CreateVestingAccount defines a method that enables creating a vesting
   * account.
   */
  CreateVestingAccount(request: MsgCreateVestingAccount): Promise<MsgCreateVestingAccountResponse>;
  /**
   * CreatePermanentLockedAccount defines a method that enables creating a permanent
   * locked account.
   *
   * Since: cosmos-sdk 0.46
   */
  CreatePermanentLockedAccount(
    request: MsgCreatePermanentLockedAccount,
  ): Promise<MsgCreatePermanentLockedAccountResponse>;
  /**
   * CreatePeriodicVestingAccount defines a method that enables creating a
   * periodic vesting account.
   *
   * Since: cosmos-sdk 0.46
   */
  CreatePeriodicVestingAccount(
    request: MsgCreatePeriodicVestingAccount,
  ): Promise<MsgCreatePeriodicVestingAccountResponse>;
}

export const MsgServiceName = "cosmos.vesting.v1beta1.Msg";
export class MsgClientImpl implements Msg {
  private readonly rpc: Rpc;
  private readonly service: string;
  constructor(rpc: Rpc, opts?: { service?: string }) {
    this.service = opts?.service || MsgServiceName;
    this.rpc = rpc;
    this.CreateVestingAccount = this.CreateVestingAccount.bind(this);
    this.CreatePermanentLockedAccount = this.CreatePermanentLockedAccount.bind(this);
    this.CreatePeriodicVestingAccount = this.CreatePeriodicVestingAccount.bind(this);
  }
  CreateVestingAccount(request: MsgCreateVestingAccount): Promise<MsgCreateVestingAccountResponse> {
    const data = MsgCreateVestingAccount.encode(request).finish();
    const promise = this.rpc.request(this.service, "CreateVestingAccount", data);
    return promise.then((data) => MsgCreateVestingAccountResponse.decode(new BinaryReader(data)));
  }

  CreatePermanentLockedAccount(
    request: MsgCreatePermanentLockedAccount,
  ): Promise<MsgCreatePermanentLockedAccountResponse> {
    const data = MsgCreatePermanentLockedAccount.encode(request).finish();
    const promise = this.rpc.request(this.service, "CreatePermanentLockedAccount", data);
    return promise.then((data) => MsgCreatePermanentLockedAccountResponse.decode(new BinaryReader(data)));
  }

  CreatePeriodicVestingAccount(
    request: MsgCreatePeriodicVestingAccount,
  ): Promise<MsgCreatePeriodicVestingAccountResponse> {
    const data = MsgCreatePeriodicVestingAccount.encode(request).finish();
    const promise = this.rpc.request(this.service, "CreatePeriodicVestingAccount", data);
    return promise.then((data) => MsgCreatePeriodicVestingAccountResponse.decode(new BinaryReader(data)));
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
