// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.3.0
//   protoc               unknown
// source: emissions/v4/events.proto

/* eslint-disable */
import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import { Nonce } from "../v3/nonce";
import { ValueBundle } from "../v3/reputer";

export const protobufPackage = "emissions.v4";

export enum ActorType {
  ACTOR_TYPE_INFERER_UNSPECIFIED = 0,
  ACTOR_TYPE_FORECASTER = 1,
  ACTOR_TYPE_REPUTER = 2,
  UNRECOGNIZED = -1,
}

export function actorTypeFromJSON(object: any): ActorType {
  switch (object) {
    case 0:
    case "ACTOR_TYPE_INFERER_UNSPECIFIED":
      return ActorType.ACTOR_TYPE_INFERER_UNSPECIFIED;
    case 1:
    case "ACTOR_TYPE_FORECASTER":
      return ActorType.ACTOR_TYPE_FORECASTER;
    case 2:
    case "ACTOR_TYPE_REPUTER":
      return ActorType.ACTOR_TYPE_REPUTER;
    case -1:
    case "UNRECOGNIZED":
    default:
      return ActorType.UNRECOGNIZED;
  }
}

export function actorTypeToJSON(object: ActorType): string {
  switch (object) {
    case ActorType.ACTOR_TYPE_INFERER_UNSPECIFIED:
      return "ACTOR_TYPE_INFERER_UNSPECIFIED";
    case ActorType.ACTOR_TYPE_FORECASTER:
      return "ACTOR_TYPE_FORECASTER";
    case ActorType.ACTOR_TYPE_REPUTER:
      return "ACTOR_TYPE_REPUTER";
    case ActorType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface EventScoresSet {
  actorType: ActorType;
  topicId: string;
  blockHeight: string;
  addresses: string[];
  scores: string[];
}

export interface EventRewardsSettled {
  actorType: ActorType;
  topicId: string;
  blockHeight: string;
  addresses: string[];
  rewards: string[];
}

export interface EventNetworkLossSet {
  topicId: string;
  blockHeight: string;
  valueBundle?: ValueBundle | undefined;
}

export interface EventForecastTaskScoreSet {
  topicId: string;
  score: string;
}

export interface EventWorkerLastCommitSet {
  topicId: string;
  blockHeight: string;
  nonce?: Nonce | undefined;
}

export interface EventReputerLastCommitSet {
  topicId: string;
  blockHeight: string;
  nonce?: Nonce | undefined;
}

export interface EventTopicRewardsSet {
  topicIds: string[];
  rewards: string[];
}

export interface EventEMAScoresSet {
  actorType: ActorType;
  topicId: string;
  nonce: string;
  addresses: string[];
  scores: string[];
  isActive: boolean[];
}

function createBaseEventScoresSet(): EventScoresSet {
  return { actorType: 0, topicId: "0", blockHeight: "0", addresses: [], scores: [] };
}

export const EventScoresSet: MessageFns<EventScoresSet> = {
  encode(message: EventScoresSet, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.actorType !== 0) {
      writer.uint32(8).int32(message.actorType);
    }
    if (message.topicId !== "0") {
      writer.uint32(16).uint64(message.topicId);
    }
    if (message.blockHeight !== "0") {
      writer.uint32(24).int64(message.blockHeight);
    }
    for (const v of message.addresses) {
      writer.uint32(34).string(v!);
    }
    for (const v of message.scores) {
      writer.uint32(42).string(v!);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): EventScoresSet {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventScoresSet();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 8) {
            break;
          }

          message.actorType = reader.int32() as any;
          continue;
        }
        case 2: {
          if (tag !== 16) {
            break;
          }

          message.topicId = reader.uint64().toString();
          continue;
        }
        case 3: {
          if (tag !== 24) {
            break;
          }

          message.blockHeight = reader.int64().toString();
          continue;
        }
        case 4: {
          if (tag !== 34) {
            break;
          }

          message.addresses.push(reader.string());
          continue;
        }
        case 5: {
          if (tag !== 42) {
            break;
          }

          message.scores.push(reader.string());
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

  fromJSON(object: any): EventScoresSet {
    return {
      actorType: isSet(object.actorType) ? actorTypeFromJSON(object.actorType) : 0,
      topicId: isSet(object.topicId) ? globalThis.String(object.topicId) : "0",
      blockHeight: isSet(object.blockHeight) ? globalThis.String(object.blockHeight) : "0",
      addresses: globalThis.Array.isArray(object?.addresses)
        ? object.addresses.map((e: any) => globalThis.String(e))
        : [],
      scores: globalThis.Array.isArray(object?.scores) ? object.scores.map((e: any) => globalThis.String(e)) : [],
    };
  },

  toJSON(message: EventScoresSet): unknown {
    const obj: any = {};
    if (message.actorType !== 0) {
      obj.actorType = actorTypeToJSON(message.actorType);
    }
    if (message.topicId !== "0") {
      obj.topicId = message.topicId;
    }
    if (message.blockHeight !== "0") {
      obj.blockHeight = message.blockHeight;
    }
    if (message.addresses?.length) {
      obj.addresses = message.addresses;
    }
    if (message.scores?.length) {
      obj.scores = message.scores;
    }
    return obj;
  },

  create(base?: DeepPartial<EventScoresSet>): EventScoresSet {
    return EventScoresSet.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<EventScoresSet>): EventScoresSet {
    const message = createBaseEventScoresSet();
    message.actorType = object.actorType ?? 0;
    message.topicId = object.topicId ?? "0";
    message.blockHeight = object.blockHeight ?? "0";
    message.addresses = object.addresses?.map((e) => e) || [];
    message.scores = object.scores?.map((e) => e) || [];
    return message;
  },
};

function createBaseEventRewardsSettled(): EventRewardsSettled {
  return { actorType: 0, topicId: "0", blockHeight: "0", addresses: [], rewards: [] };
}

export const EventRewardsSettled: MessageFns<EventRewardsSettled> = {
  encode(message: EventRewardsSettled, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.actorType !== 0) {
      writer.uint32(8).int32(message.actorType);
    }
    if (message.topicId !== "0") {
      writer.uint32(16).uint64(message.topicId);
    }
    if (message.blockHeight !== "0") {
      writer.uint32(24).int64(message.blockHeight);
    }
    for (const v of message.addresses) {
      writer.uint32(34).string(v!);
    }
    for (const v of message.rewards) {
      writer.uint32(42).string(v!);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): EventRewardsSettled {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventRewardsSettled();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 8) {
            break;
          }

          message.actorType = reader.int32() as any;
          continue;
        }
        case 2: {
          if (tag !== 16) {
            break;
          }

          message.topicId = reader.uint64().toString();
          continue;
        }
        case 3: {
          if (tag !== 24) {
            break;
          }

          message.blockHeight = reader.int64().toString();
          continue;
        }
        case 4: {
          if (tag !== 34) {
            break;
          }

          message.addresses.push(reader.string());
          continue;
        }
        case 5: {
          if (tag !== 42) {
            break;
          }

          message.rewards.push(reader.string());
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

  fromJSON(object: any): EventRewardsSettled {
    return {
      actorType: isSet(object.actorType) ? actorTypeFromJSON(object.actorType) : 0,
      topicId: isSet(object.topicId) ? globalThis.String(object.topicId) : "0",
      blockHeight: isSet(object.blockHeight) ? globalThis.String(object.blockHeight) : "0",
      addresses: globalThis.Array.isArray(object?.addresses)
        ? object.addresses.map((e: any) => globalThis.String(e))
        : [],
      rewards: globalThis.Array.isArray(object?.rewards) ? object.rewards.map((e: any) => globalThis.String(e)) : [],
    };
  },

  toJSON(message: EventRewardsSettled): unknown {
    const obj: any = {};
    if (message.actorType !== 0) {
      obj.actorType = actorTypeToJSON(message.actorType);
    }
    if (message.topicId !== "0") {
      obj.topicId = message.topicId;
    }
    if (message.blockHeight !== "0") {
      obj.blockHeight = message.blockHeight;
    }
    if (message.addresses?.length) {
      obj.addresses = message.addresses;
    }
    if (message.rewards?.length) {
      obj.rewards = message.rewards;
    }
    return obj;
  },

  create(base?: DeepPartial<EventRewardsSettled>): EventRewardsSettled {
    return EventRewardsSettled.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<EventRewardsSettled>): EventRewardsSettled {
    const message = createBaseEventRewardsSettled();
    message.actorType = object.actorType ?? 0;
    message.topicId = object.topicId ?? "0";
    message.blockHeight = object.blockHeight ?? "0";
    message.addresses = object.addresses?.map((e) => e) || [];
    message.rewards = object.rewards?.map((e) => e) || [];
    return message;
  },
};

function createBaseEventNetworkLossSet(): EventNetworkLossSet {
  return { topicId: "0", blockHeight: "0", valueBundle: undefined };
}

export const EventNetworkLossSet: MessageFns<EventNetworkLossSet> = {
  encode(message: EventNetworkLossSet, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.topicId !== "0") {
      writer.uint32(8).uint64(message.topicId);
    }
    if (message.blockHeight !== "0") {
      writer.uint32(16).int64(message.blockHeight);
    }
    if (message.valueBundle !== undefined) {
      ValueBundle.encode(message.valueBundle, writer.uint32(26).fork()).join();
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): EventNetworkLossSet {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventNetworkLossSet();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 8) {
            break;
          }

          message.topicId = reader.uint64().toString();
          continue;
        }
        case 2: {
          if (tag !== 16) {
            break;
          }

          message.blockHeight = reader.int64().toString();
          continue;
        }
        case 3: {
          if (tag !== 26) {
            break;
          }

          message.valueBundle = ValueBundle.decode(reader, reader.uint32());
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

  fromJSON(object: any): EventNetworkLossSet {
    return {
      topicId: isSet(object.topicId) ? globalThis.String(object.topicId) : "0",
      blockHeight: isSet(object.blockHeight) ? globalThis.String(object.blockHeight) : "0",
      valueBundle: isSet(object.valueBundle) ? ValueBundle.fromJSON(object.valueBundle) : undefined,
    };
  },

  toJSON(message: EventNetworkLossSet): unknown {
    const obj: any = {};
    if (message.topicId !== "0") {
      obj.topicId = message.topicId;
    }
    if (message.blockHeight !== "0") {
      obj.blockHeight = message.blockHeight;
    }
    if (message.valueBundle !== undefined) {
      obj.valueBundle = ValueBundle.toJSON(message.valueBundle);
    }
    return obj;
  },

  create(base?: DeepPartial<EventNetworkLossSet>): EventNetworkLossSet {
    return EventNetworkLossSet.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<EventNetworkLossSet>): EventNetworkLossSet {
    const message = createBaseEventNetworkLossSet();
    message.topicId = object.topicId ?? "0";
    message.blockHeight = object.blockHeight ?? "0";
    message.valueBundle = (object.valueBundle !== undefined && object.valueBundle !== null)
      ? ValueBundle.fromPartial(object.valueBundle)
      : undefined;
    return message;
  },
};

function createBaseEventForecastTaskScoreSet(): EventForecastTaskScoreSet {
  return { topicId: "0", score: "" };
}

export const EventForecastTaskScoreSet: MessageFns<EventForecastTaskScoreSet> = {
  encode(message: EventForecastTaskScoreSet, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.topicId !== "0") {
      writer.uint32(8).uint64(message.topicId);
    }
    if (message.score !== "") {
      writer.uint32(18).string(message.score);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): EventForecastTaskScoreSet {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventForecastTaskScoreSet();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 8) {
            break;
          }

          message.topicId = reader.uint64().toString();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.score = reader.string();
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

  fromJSON(object: any): EventForecastTaskScoreSet {
    return {
      topicId: isSet(object.topicId) ? globalThis.String(object.topicId) : "0",
      score: isSet(object.score) ? globalThis.String(object.score) : "",
    };
  },

  toJSON(message: EventForecastTaskScoreSet): unknown {
    const obj: any = {};
    if (message.topicId !== "0") {
      obj.topicId = message.topicId;
    }
    if (message.score !== "") {
      obj.score = message.score;
    }
    return obj;
  },

  create(base?: DeepPartial<EventForecastTaskScoreSet>): EventForecastTaskScoreSet {
    return EventForecastTaskScoreSet.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<EventForecastTaskScoreSet>): EventForecastTaskScoreSet {
    const message = createBaseEventForecastTaskScoreSet();
    message.topicId = object.topicId ?? "0";
    message.score = object.score ?? "";
    return message;
  },
};

function createBaseEventWorkerLastCommitSet(): EventWorkerLastCommitSet {
  return { topicId: "0", blockHeight: "0", nonce: undefined };
}

export const EventWorkerLastCommitSet: MessageFns<EventWorkerLastCommitSet> = {
  encode(message: EventWorkerLastCommitSet, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.topicId !== "0") {
      writer.uint32(8).uint64(message.topicId);
    }
    if (message.blockHeight !== "0") {
      writer.uint32(16).int64(message.blockHeight);
    }
    if (message.nonce !== undefined) {
      Nonce.encode(message.nonce, writer.uint32(26).fork()).join();
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): EventWorkerLastCommitSet {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventWorkerLastCommitSet();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 8) {
            break;
          }

          message.topicId = reader.uint64().toString();
          continue;
        }
        case 2: {
          if (tag !== 16) {
            break;
          }

          message.blockHeight = reader.int64().toString();
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

  fromJSON(object: any): EventWorkerLastCommitSet {
    return {
      topicId: isSet(object.topicId) ? globalThis.String(object.topicId) : "0",
      blockHeight: isSet(object.blockHeight) ? globalThis.String(object.blockHeight) : "0",
      nonce: isSet(object.nonce) ? Nonce.fromJSON(object.nonce) : undefined,
    };
  },

  toJSON(message: EventWorkerLastCommitSet): unknown {
    const obj: any = {};
    if (message.topicId !== "0") {
      obj.topicId = message.topicId;
    }
    if (message.blockHeight !== "0") {
      obj.blockHeight = message.blockHeight;
    }
    if (message.nonce !== undefined) {
      obj.nonce = Nonce.toJSON(message.nonce);
    }
    return obj;
  },

  create(base?: DeepPartial<EventWorkerLastCommitSet>): EventWorkerLastCommitSet {
    return EventWorkerLastCommitSet.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<EventWorkerLastCommitSet>): EventWorkerLastCommitSet {
    const message = createBaseEventWorkerLastCommitSet();
    message.topicId = object.topicId ?? "0";
    message.blockHeight = object.blockHeight ?? "0";
    message.nonce = (object.nonce !== undefined && object.nonce !== null) ? Nonce.fromPartial(object.nonce) : undefined;
    return message;
  },
};

function createBaseEventReputerLastCommitSet(): EventReputerLastCommitSet {
  return { topicId: "0", blockHeight: "0", nonce: undefined };
}

export const EventReputerLastCommitSet: MessageFns<EventReputerLastCommitSet> = {
  encode(message: EventReputerLastCommitSet, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.topicId !== "0") {
      writer.uint32(8).uint64(message.topicId);
    }
    if (message.blockHeight !== "0") {
      writer.uint32(16).int64(message.blockHeight);
    }
    if (message.nonce !== undefined) {
      Nonce.encode(message.nonce, writer.uint32(26).fork()).join();
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): EventReputerLastCommitSet {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventReputerLastCommitSet();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 8) {
            break;
          }

          message.topicId = reader.uint64().toString();
          continue;
        }
        case 2: {
          if (tag !== 16) {
            break;
          }

          message.blockHeight = reader.int64().toString();
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

  fromJSON(object: any): EventReputerLastCommitSet {
    return {
      topicId: isSet(object.topicId) ? globalThis.String(object.topicId) : "0",
      blockHeight: isSet(object.blockHeight) ? globalThis.String(object.blockHeight) : "0",
      nonce: isSet(object.nonce) ? Nonce.fromJSON(object.nonce) : undefined,
    };
  },

  toJSON(message: EventReputerLastCommitSet): unknown {
    const obj: any = {};
    if (message.topicId !== "0") {
      obj.topicId = message.topicId;
    }
    if (message.blockHeight !== "0") {
      obj.blockHeight = message.blockHeight;
    }
    if (message.nonce !== undefined) {
      obj.nonce = Nonce.toJSON(message.nonce);
    }
    return obj;
  },

  create(base?: DeepPartial<EventReputerLastCommitSet>): EventReputerLastCommitSet {
    return EventReputerLastCommitSet.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<EventReputerLastCommitSet>): EventReputerLastCommitSet {
    const message = createBaseEventReputerLastCommitSet();
    message.topicId = object.topicId ?? "0";
    message.blockHeight = object.blockHeight ?? "0";
    message.nonce = (object.nonce !== undefined && object.nonce !== null) ? Nonce.fromPartial(object.nonce) : undefined;
    return message;
  },
};

function createBaseEventTopicRewardsSet(): EventTopicRewardsSet {
  return { topicIds: [], rewards: [] };
}

export const EventTopicRewardsSet: MessageFns<EventTopicRewardsSet> = {
  encode(message: EventTopicRewardsSet, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    writer.uint32(10).fork();
    for (const v of message.topicIds) {
      writer.uint64(v);
    }
    writer.join();
    for (const v of message.rewards) {
      writer.uint32(18).string(v!);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): EventTopicRewardsSet {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventTopicRewardsSet();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag === 8) {
            message.topicIds.push(reader.uint64().toString());

            continue;
          }

          if (tag === 10) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.topicIds.push(reader.uint64().toString());
            }

            continue;
          }

          break;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.rewards.push(reader.string());
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

  fromJSON(object: any): EventTopicRewardsSet {
    return {
      topicIds: globalThis.Array.isArray(object?.topicIds) ? object.topicIds.map((e: any) => globalThis.String(e)) : [],
      rewards: globalThis.Array.isArray(object?.rewards) ? object.rewards.map((e: any) => globalThis.String(e)) : [],
    };
  },

  toJSON(message: EventTopicRewardsSet): unknown {
    const obj: any = {};
    if (message.topicIds?.length) {
      obj.topicIds = message.topicIds;
    }
    if (message.rewards?.length) {
      obj.rewards = message.rewards;
    }
    return obj;
  },

  create(base?: DeepPartial<EventTopicRewardsSet>): EventTopicRewardsSet {
    return EventTopicRewardsSet.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<EventTopicRewardsSet>): EventTopicRewardsSet {
    const message = createBaseEventTopicRewardsSet();
    message.topicIds = object.topicIds?.map((e) => e) || [];
    message.rewards = object.rewards?.map((e) => e) || [];
    return message;
  },
};

function createBaseEventEMAScoresSet(): EventEMAScoresSet {
  return { actorType: 0, topicId: "0", nonce: "0", addresses: [], scores: [], isActive: [] };
}

export const EventEMAScoresSet: MessageFns<EventEMAScoresSet> = {
  encode(message: EventEMAScoresSet, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.actorType !== 0) {
      writer.uint32(8).int32(message.actorType);
    }
    if (message.topicId !== "0") {
      writer.uint32(16).uint64(message.topicId);
    }
    if (message.nonce !== "0") {
      writer.uint32(24).int64(message.nonce);
    }
    for (const v of message.addresses) {
      writer.uint32(34).string(v!);
    }
    for (const v of message.scores) {
      writer.uint32(42).string(v!);
    }
    writer.uint32(50).fork();
    for (const v of message.isActive) {
      writer.bool(v);
    }
    writer.join();
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): EventEMAScoresSet {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventEMAScoresSet();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 8) {
            break;
          }

          message.actorType = reader.int32() as any;
          continue;
        }
        case 2: {
          if (tag !== 16) {
            break;
          }

          message.topicId = reader.uint64().toString();
          continue;
        }
        case 3: {
          if (tag !== 24) {
            break;
          }

          message.nonce = reader.int64().toString();
          continue;
        }
        case 4: {
          if (tag !== 34) {
            break;
          }

          message.addresses.push(reader.string());
          continue;
        }
        case 5: {
          if (tag !== 42) {
            break;
          }

          message.scores.push(reader.string());
          continue;
        }
        case 6: {
          if (tag === 48) {
            message.isActive.push(reader.bool());

            continue;
          }

          if (tag === 50) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.isActive.push(reader.bool());
            }

            continue;
          }

          break;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): EventEMAScoresSet {
    return {
      actorType: isSet(object.actorType) ? actorTypeFromJSON(object.actorType) : 0,
      topicId: isSet(object.topicId) ? globalThis.String(object.topicId) : "0",
      nonce: isSet(object.nonce) ? globalThis.String(object.nonce) : "0",
      addresses: globalThis.Array.isArray(object?.addresses)
        ? object.addresses.map((e: any) => globalThis.String(e))
        : [],
      scores: globalThis.Array.isArray(object?.scores) ? object.scores.map((e: any) => globalThis.String(e)) : [],
      isActive: globalThis.Array.isArray(object?.isActive)
        ? object.isActive.map((e: any) => globalThis.Boolean(e))
        : [],
    };
  },

  toJSON(message: EventEMAScoresSet): unknown {
    const obj: any = {};
    if (message.actorType !== 0) {
      obj.actorType = actorTypeToJSON(message.actorType);
    }
    if (message.topicId !== "0") {
      obj.topicId = message.topicId;
    }
    if (message.nonce !== "0") {
      obj.nonce = message.nonce;
    }
    if (message.addresses?.length) {
      obj.addresses = message.addresses;
    }
    if (message.scores?.length) {
      obj.scores = message.scores;
    }
    if (message.isActive?.length) {
      obj.isActive = message.isActive;
    }
    return obj;
  },

  create(base?: DeepPartial<EventEMAScoresSet>): EventEMAScoresSet {
    return EventEMAScoresSet.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<EventEMAScoresSet>): EventEMAScoresSet {
    const message = createBaseEventEMAScoresSet();
    message.actorType = object.actorType ?? 0;
    message.topicId = object.topicId ?? "0";
    message.nonce = object.nonce ?? "0";
    message.addresses = object.addresses?.map((e) => e) || [];
    message.scores = object.scores?.map((e) => e) || [];
    message.isActive = object.isActive?.map((e) => e) || [];
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
