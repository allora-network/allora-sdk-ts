// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.3.0
//   protoc               unknown
// source: emissions/v1/topic.proto

/* eslint-disable */
import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import { Nonce } from "./nonce";

export const protobufPackage = "emissions.v1";

export interface Topic {
  id: string;
  creator: string;
  metadata: string;
  lossLogic: string;
  lossMethod: string;
  inferenceLogic: string;
  inferenceMethod: string;
  epochLastEnded: string;
  epochLength: string;
  groundTruthLag: string;
  defaultArg: string;
  pNorm: string;
  alphaRegret: string;
  allowNegative: boolean;
}

export interface TopicList {
  topics: Topic[];
}

export interface TimestampedActorNonce {
  /** height at which value calculated or received */
  blockHeight: string;
  actor: string;
  nonce?: Nonce | undefined;
}

function createBaseTopic(): Topic {
  return {
    id: "0",
    creator: "",
    metadata: "",
    lossLogic: "",
    lossMethod: "",
    inferenceLogic: "",
    inferenceMethod: "",
    epochLastEnded: "0",
    epochLength: "0",
    groundTruthLag: "0",
    defaultArg: "",
    pNorm: "",
    alphaRegret: "",
    allowNegative: false,
  };
}

export const Topic: MessageFns<Topic> = {
  encode(message: Topic, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.id !== "0") {
      writer.uint32(8).uint64(message.id);
    }
    if (message.creator !== "") {
      writer.uint32(18).string(message.creator);
    }
    if (message.metadata !== "") {
      writer.uint32(26).string(message.metadata);
    }
    if (message.lossLogic !== "") {
      writer.uint32(34).string(message.lossLogic);
    }
    if (message.lossMethod !== "") {
      writer.uint32(42).string(message.lossMethod);
    }
    if (message.inferenceLogic !== "") {
      writer.uint32(50).string(message.inferenceLogic);
    }
    if (message.inferenceMethod !== "") {
      writer.uint32(58).string(message.inferenceMethod);
    }
    if (message.epochLastEnded !== "0") {
      writer.uint32(64).int64(message.epochLastEnded);
    }
    if (message.epochLength !== "0") {
      writer.uint32(72).int64(message.epochLength);
    }
    if (message.groundTruthLag !== "0") {
      writer.uint32(80).int64(message.groundTruthLag);
    }
    if (message.defaultArg !== "") {
      writer.uint32(90).string(message.defaultArg);
    }
    if (message.pNorm !== "") {
      writer.uint32(98).string(message.pNorm);
    }
    if (message.alphaRegret !== "") {
      writer.uint32(106).string(message.alphaRegret);
    }
    if (message.allowNegative !== false) {
      writer.uint32(112).bool(message.allowNegative);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): Topic {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTopic();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 8) {
            break;
          }

          message.id = reader.uint64().toString();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.creator = reader.string();
          continue;
        }
        case 3: {
          if (tag !== 26) {
            break;
          }

          message.metadata = reader.string();
          continue;
        }
        case 4: {
          if (tag !== 34) {
            break;
          }

          message.lossLogic = reader.string();
          continue;
        }
        case 5: {
          if (tag !== 42) {
            break;
          }

          message.lossMethod = reader.string();
          continue;
        }
        case 6: {
          if (tag !== 50) {
            break;
          }

          message.inferenceLogic = reader.string();
          continue;
        }
        case 7: {
          if (tag !== 58) {
            break;
          }

          message.inferenceMethod = reader.string();
          continue;
        }
        case 8: {
          if (tag !== 64) {
            break;
          }

          message.epochLastEnded = reader.int64().toString();
          continue;
        }
        case 9: {
          if (tag !== 72) {
            break;
          }

          message.epochLength = reader.int64().toString();
          continue;
        }
        case 10: {
          if (tag !== 80) {
            break;
          }

          message.groundTruthLag = reader.int64().toString();
          continue;
        }
        case 11: {
          if (tag !== 90) {
            break;
          }

          message.defaultArg = reader.string();
          continue;
        }
        case 12: {
          if (tag !== 98) {
            break;
          }

          message.pNorm = reader.string();
          continue;
        }
        case 13: {
          if (tag !== 106) {
            break;
          }

          message.alphaRegret = reader.string();
          continue;
        }
        case 14: {
          if (tag !== 112) {
            break;
          }

          message.allowNegative = reader.bool();
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

  fromJSON(object: any): Topic {
    return {
      id: isSet(object.id) ? globalThis.String(object.id) : "0",
      creator: isSet(object.creator) ? globalThis.String(object.creator) : "",
      metadata: isSet(object.metadata) ? globalThis.String(object.metadata) : "",
      lossLogic: isSet(object.lossLogic) ? globalThis.String(object.lossLogic) : "",
      lossMethod: isSet(object.lossMethod) ? globalThis.String(object.lossMethod) : "",
      inferenceLogic: isSet(object.inferenceLogic) ? globalThis.String(object.inferenceLogic) : "",
      inferenceMethod: isSet(object.inferenceMethod) ? globalThis.String(object.inferenceMethod) : "",
      epochLastEnded: isSet(object.epochLastEnded) ? globalThis.String(object.epochLastEnded) : "0",
      epochLength: isSet(object.epochLength) ? globalThis.String(object.epochLength) : "0",
      groundTruthLag: isSet(object.groundTruthLag) ? globalThis.String(object.groundTruthLag) : "0",
      defaultArg: isSet(object.defaultArg) ? globalThis.String(object.defaultArg) : "",
      pNorm: isSet(object.pNorm) ? globalThis.String(object.pNorm) : "",
      alphaRegret: isSet(object.alphaRegret) ? globalThis.String(object.alphaRegret) : "",
      allowNegative: isSet(object.allowNegative) ? globalThis.Boolean(object.allowNegative) : false,
    };
  },

  toJSON(message: Topic): unknown {
    const obj: any = {};
    if (message.id !== "0") {
      obj.id = message.id;
    }
    if (message.creator !== "") {
      obj.creator = message.creator;
    }
    if (message.metadata !== "") {
      obj.metadata = message.metadata;
    }
    if (message.lossLogic !== "") {
      obj.lossLogic = message.lossLogic;
    }
    if (message.lossMethod !== "") {
      obj.lossMethod = message.lossMethod;
    }
    if (message.inferenceLogic !== "") {
      obj.inferenceLogic = message.inferenceLogic;
    }
    if (message.inferenceMethod !== "") {
      obj.inferenceMethod = message.inferenceMethod;
    }
    if (message.epochLastEnded !== "0") {
      obj.epochLastEnded = message.epochLastEnded;
    }
    if (message.epochLength !== "0") {
      obj.epochLength = message.epochLength;
    }
    if (message.groundTruthLag !== "0") {
      obj.groundTruthLag = message.groundTruthLag;
    }
    if (message.defaultArg !== "") {
      obj.defaultArg = message.defaultArg;
    }
    if (message.pNorm !== "") {
      obj.pNorm = message.pNorm;
    }
    if (message.alphaRegret !== "") {
      obj.alphaRegret = message.alphaRegret;
    }
    if (message.allowNegative !== false) {
      obj.allowNegative = message.allowNegative;
    }
    return obj;
  },

  create(base?: DeepPartial<Topic>): Topic {
    return Topic.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Topic>): Topic {
    const message = createBaseTopic();
    message.id = object.id ?? "0";
    message.creator = object.creator ?? "";
    message.metadata = object.metadata ?? "";
    message.lossLogic = object.lossLogic ?? "";
    message.lossMethod = object.lossMethod ?? "";
    message.inferenceLogic = object.inferenceLogic ?? "";
    message.inferenceMethod = object.inferenceMethod ?? "";
    message.epochLastEnded = object.epochLastEnded ?? "0";
    message.epochLength = object.epochLength ?? "0";
    message.groundTruthLag = object.groundTruthLag ?? "0";
    message.defaultArg = object.defaultArg ?? "";
    message.pNorm = object.pNorm ?? "";
    message.alphaRegret = object.alphaRegret ?? "";
    message.allowNegative = object.allowNegative ?? false;
    return message;
  },
};

function createBaseTopicList(): TopicList {
  return { topics: [] };
}

export const TopicList: MessageFns<TopicList> = {
  encode(message: TopicList, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    for (const v of message.topics) {
      Topic.encode(v!, writer.uint32(10).fork()).join();
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): TopicList {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTopicList();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.topics.push(Topic.decode(reader, reader.uint32()));
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

  fromJSON(object: any): TopicList {
    return { topics: globalThis.Array.isArray(object?.topics) ? object.topics.map((e: any) => Topic.fromJSON(e)) : [] };
  },

  toJSON(message: TopicList): unknown {
    const obj: any = {};
    if (message.topics?.length) {
      obj.topics = message.topics.map((e) => Topic.toJSON(e));
    }
    return obj;
  },

  create(base?: DeepPartial<TopicList>): TopicList {
    return TopicList.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<TopicList>): TopicList {
    const message = createBaseTopicList();
    message.topics = object.topics?.map((e) => Topic.fromPartial(e)) || [];
    return message;
  },
};

function createBaseTimestampedActorNonce(): TimestampedActorNonce {
  return { blockHeight: "0", actor: "", nonce: undefined };
}

export const TimestampedActorNonce: MessageFns<TimestampedActorNonce> = {
  encode(message: TimestampedActorNonce, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.blockHeight !== "0") {
      writer.uint32(8).int64(message.blockHeight);
    }
    if (message.actor !== "") {
      writer.uint32(18).string(message.actor);
    }
    if (message.nonce !== undefined) {
      Nonce.encode(message.nonce, writer.uint32(26).fork()).join();
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): TimestampedActorNonce {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTimestampedActorNonce();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 8) {
            break;
          }

          message.blockHeight = reader.int64().toString();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.actor = reader.string();
          continue;
        }
        case 3: {
          if (tag !== 26) {
            break;
          }

          message.nonce = Nonce.decode(reader, reader.uint32());
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

  fromJSON(object: any): TimestampedActorNonce {
    return {
      blockHeight: isSet(object.blockHeight) ? globalThis.String(object.blockHeight) : "0",
      actor: isSet(object.actor) ? globalThis.String(object.actor) : "",
      nonce: isSet(object.nonce) ? Nonce.fromJSON(object.nonce) : undefined,
    };
  },

  toJSON(message: TimestampedActorNonce): unknown {
    const obj: any = {};
    if (message.blockHeight !== "0") {
      obj.blockHeight = message.blockHeight;
    }
    if (message.actor !== "") {
      obj.actor = message.actor;
    }
    if (message.nonce !== undefined) {
      obj.nonce = Nonce.toJSON(message.nonce);
    }
    return obj;
  },

  create(base?: DeepPartial<TimestampedActorNonce>): TimestampedActorNonce {
    return TimestampedActorNonce.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<TimestampedActorNonce>): TimestampedActorNonce {
    const message = createBaseTimestampedActorNonce();
    message.blockHeight = object.blockHeight ?? "0";
    message.actor = object.actor ?? "";
    message.nonce = (object.nonce !== undefined && object.nonce !== null) ? Nonce.fromPartial(object.nonce) : undefined;
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
