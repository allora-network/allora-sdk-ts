// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.3.0
//   protoc               unknown
// source: cosmos/counter/v1/query.proto

/* eslint-disable */
import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";

export const protobufPackage = "cosmos.counter.v1";

/** QueryGetCountRequest defines the request type for querying x/mock count. */
export interface QueryGetCountRequest {
}

/** QueryGetCountResponse defines the response type for querying x/mock count. */
export interface QueryGetCountResponse {
  totalCount: string;
}

function createBaseQueryGetCountRequest(): QueryGetCountRequest {
  return {};
}

export const QueryGetCountRequest: MessageFns<QueryGetCountRequest> = {
  encode(_: QueryGetCountRequest, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): QueryGetCountRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetCountRequest();
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

  fromJSON(_: any): QueryGetCountRequest {
    return {};
  },

  toJSON(_: QueryGetCountRequest): unknown {
    const obj: any = {};
    return obj;
  },

  create(base?: DeepPartial<QueryGetCountRequest>): QueryGetCountRequest {
    return QueryGetCountRequest.fromPartial(base ?? {});
  },
  fromPartial(_: DeepPartial<QueryGetCountRequest>): QueryGetCountRequest {
    const message = createBaseQueryGetCountRequest();
    return message;
  },
};

function createBaseQueryGetCountResponse(): QueryGetCountResponse {
  return { totalCount: "0" };
}

export const QueryGetCountResponse: MessageFns<QueryGetCountResponse> = {
  encode(message: QueryGetCountResponse, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.totalCount !== "0") {
      writer.uint32(8).int64(message.totalCount);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): QueryGetCountResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetCountResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 8) {
            break;
          }

          message.totalCount = reader.int64().toString();
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

  fromJSON(object: any): QueryGetCountResponse {
    return { totalCount: isSet(object.totalCount) ? globalThis.String(object.totalCount) : "0" };
  },

  toJSON(message: QueryGetCountResponse): unknown {
    const obj: any = {};
    if (message.totalCount !== "0") {
      obj.totalCount = message.totalCount;
    }
    return obj;
  },

  create(base?: DeepPartial<QueryGetCountResponse>): QueryGetCountResponse {
    return QueryGetCountResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<QueryGetCountResponse>): QueryGetCountResponse {
    const message = createBaseQueryGetCountResponse();
    message.totalCount = object.totalCount ?? "0";
    return message;
  },
};

/** Query defines the gRPC querier service. */
export interface Query {
  /** GetCount queries the parameters of x/Counter module. */
  GetCount(request: QueryGetCountRequest): Promise<QueryGetCountResponse>;
}

export const QueryServiceName = "cosmos.counter.v1.Query";
export class QueryClientImpl implements Query {
  private readonly rpc: Rpc;
  private readonly service: string;
  constructor(rpc: Rpc, opts?: { service?: string }) {
    this.service = opts?.service || QueryServiceName;
    this.rpc = rpc;
    this.GetCount = this.GetCount.bind(this);
  }
  GetCount(request: QueryGetCountRequest): Promise<QueryGetCountResponse> {
    const data = QueryGetCountRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "GetCount", data);
    return promise.then((data) => QueryGetCountResponse.decode(new BinaryReader(data)));
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
