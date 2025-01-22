// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.3.0
//   protoc               unknown
// source: cosmos/group/v1/genesis.proto

/* eslint-disable */
import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import { GroupInfo, GroupMember, GroupPolicyInfo, Proposal, Vote } from "./types";

export const protobufPackage = "cosmos.group.v1";

/** Since: cosmos-sdk 0.46 */

/** GenesisState defines the group module's genesis state. */
export interface GenesisState {
  /**
   * group_seq is the group table orm.Sequence,
   * it is used to get the next group ID.
   */
  groupSeq: string;
  /** groups is the list of groups info. */
  groups: GroupInfo[];
  /** group_members is the list of groups members. */
  groupMembers: GroupMember[];
  /**
   * group_policy_seq is the group policy table orm.Sequence,
   * it is used to generate the next group policy account address.
   */
  groupPolicySeq: string;
  /** group_policies is the list of group policies info. */
  groupPolicies: GroupPolicyInfo[];
  /**
   * proposal_seq is the proposal table orm.Sequence,
   * it is used to get the next proposal ID.
   */
  proposalSeq: string;
  /** proposals is the list of proposals. */
  proposals: Proposal[];
  /** votes is the list of votes. */
  votes: Vote[];
}

function createBaseGenesisState(): GenesisState {
  return {
    groupSeq: "0",
    groups: [],
    groupMembers: [],
    groupPolicySeq: "0",
    groupPolicies: [],
    proposalSeq: "0",
    proposals: [],
    votes: [],
  };
}

export const GenesisState: MessageFns<GenesisState> = {
  encode(message: GenesisState, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.groupSeq !== "0") {
      writer.uint32(8).uint64(message.groupSeq);
    }
    for (const v of message.groups) {
      GroupInfo.encode(v!, writer.uint32(18).fork()).join();
    }
    for (const v of message.groupMembers) {
      GroupMember.encode(v!, writer.uint32(26).fork()).join();
    }
    if (message.groupPolicySeq !== "0") {
      writer.uint32(32).uint64(message.groupPolicySeq);
    }
    for (const v of message.groupPolicies) {
      GroupPolicyInfo.encode(v!, writer.uint32(42).fork()).join();
    }
    if (message.proposalSeq !== "0") {
      writer.uint32(48).uint64(message.proposalSeq);
    }
    for (const v of message.proposals) {
      Proposal.encode(v!, writer.uint32(58).fork()).join();
    }
    for (const v of message.votes) {
      Vote.encode(v!, writer.uint32(66).fork()).join();
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
          if (tag !== 8) {
            break;
          }

          message.groupSeq = reader.uint64().toString();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.groups.push(GroupInfo.decode(reader, reader.uint32()));
          continue;
        }
        case 3: {
          if (tag !== 26) {
            break;
          }

          message.groupMembers.push(GroupMember.decode(reader, reader.uint32()));
          continue;
        }
        case 4: {
          if (tag !== 32) {
            break;
          }

          message.groupPolicySeq = reader.uint64().toString();
          continue;
        }
        case 5: {
          if (tag !== 42) {
            break;
          }

          message.groupPolicies.push(GroupPolicyInfo.decode(reader, reader.uint32()));
          continue;
        }
        case 6: {
          if (tag !== 48) {
            break;
          }

          message.proposalSeq = reader.uint64().toString();
          continue;
        }
        case 7: {
          if (tag !== 58) {
            break;
          }

          message.proposals.push(Proposal.decode(reader, reader.uint32()));
          continue;
        }
        case 8: {
          if (tag !== 66) {
            break;
          }

          message.votes.push(Vote.decode(reader, reader.uint32()));
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
      groupSeq: isSet(object.groupSeq) ? globalThis.String(object.groupSeq) : "0",
      groups: globalThis.Array.isArray(object?.groups) ? object.groups.map((e: any) => GroupInfo.fromJSON(e)) : [],
      groupMembers: globalThis.Array.isArray(object?.groupMembers)
        ? object.groupMembers.map((e: any) => GroupMember.fromJSON(e))
        : [],
      groupPolicySeq: isSet(object.groupPolicySeq) ? globalThis.String(object.groupPolicySeq) : "0",
      groupPolicies: globalThis.Array.isArray(object?.groupPolicies)
        ? object.groupPolicies.map((e: any) => GroupPolicyInfo.fromJSON(e))
        : [],
      proposalSeq: isSet(object.proposalSeq) ? globalThis.String(object.proposalSeq) : "0",
      proposals: globalThis.Array.isArray(object?.proposals)
        ? object.proposals.map((e: any) => Proposal.fromJSON(e))
        : [],
      votes: globalThis.Array.isArray(object?.votes) ? object.votes.map((e: any) => Vote.fromJSON(e)) : [],
    };
  },

  toJSON(message: GenesisState): unknown {
    const obj: any = {};
    if (message.groupSeq !== "0") {
      obj.groupSeq = message.groupSeq;
    }
    if (message.groups?.length) {
      obj.groups = message.groups.map((e) => GroupInfo.toJSON(e));
    }
    if (message.groupMembers?.length) {
      obj.groupMembers = message.groupMembers.map((e) => GroupMember.toJSON(e));
    }
    if (message.groupPolicySeq !== "0") {
      obj.groupPolicySeq = message.groupPolicySeq;
    }
    if (message.groupPolicies?.length) {
      obj.groupPolicies = message.groupPolicies.map((e) => GroupPolicyInfo.toJSON(e));
    }
    if (message.proposalSeq !== "0") {
      obj.proposalSeq = message.proposalSeq;
    }
    if (message.proposals?.length) {
      obj.proposals = message.proposals.map((e) => Proposal.toJSON(e));
    }
    if (message.votes?.length) {
      obj.votes = message.votes.map((e) => Vote.toJSON(e));
    }
    return obj;
  },

  create(base?: DeepPartial<GenesisState>): GenesisState {
    return GenesisState.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GenesisState>): GenesisState {
    const message = createBaseGenesisState();
    message.groupSeq = object.groupSeq ?? "0";
    message.groups = object.groups?.map((e) => GroupInfo.fromPartial(e)) || [];
    message.groupMembers = object.groupMembers?.map((e) => GroupMember.fromPartial(e)) || [];
    message.groupPolicySeq = object.groupPolicySeq ?? "0";
    message.groupPolicies = object.groupPolicies?.map((e) => GroupPolicyInfo.fromPartial(e)) || [];
    message.proposalSeq = object.proposalSeq ?? "0";
    message.proposals = object.proposals?.map((e) => Proposal.fromPartial(e)) || [];
    message.votes = object.votes?.map((e) => Vote.fromPartial(e)) || [];
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
