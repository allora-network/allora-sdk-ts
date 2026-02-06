SHELL := /bin/bash
.ONESHELL:
.SHELLFLAGS := -eu -o pipefail -c
.DELETE_ON_ERROR:

# --- Paths
PROTO_DEPS := ./proto-deps
COSMOS_SDK_DIR := $(PROTO_DEPS)/cosmos-sdk
COSMOS_PROTO_DIR := $(PROTO_DEPS)/cosmos-proto
FEEMARKET_DIR := $(PROTO_DEPS)/feemarket
GOGOPROTO_DIR := $(PROTO_DEPS)/gogoproto
GOOGLEAPIS_DIR := $(PROTO_DEPS)/googleapis
ALLORA_CHAIN_DIR := $(PROTO_DEPS)/allora-chain

PROTOS_OUT_DIR := ./src/v2/types/generated

# --- Stamps
PROTO_STAMP := $(PROTOS_OUT_DIR)/.generated.stamp

# --- Default
.PHONY: dev
dev: proto
	@echo "✅ Ready for development."

# --- Git dependencies (same versions as Python SDK)
$(GOGOPROTO_DIR)/.git:
	rm -rf "$(GOGOPROTO_DIR)"
	git clone --depth 1 --single-branch --branch v1.7.0 \
	  https://github.com/cosmos/gogoproto "$(GOGOPROTO_DIR)"

$(COSMOS_PROTO_DIR)/.git:
	rm -rf "$(COSMOS_PROTO_DIR)"
	git clone --depth 1 --single-branch --branch v1.0.0-beta.5 \
	  https://github.com/cosmos/cosmos-proto "$(COSMOS_PROTO_DIR)"

$(COSMOS_SDK_DIR)/.git:
	rm -rf "$(COSMOS_SDK_DIR)"
	git clone --depth 1 --single-branch --branch v0.50.14 \
	  https://github.com/cosmos/cosmos-sdk "$(COSMOS_SDK_DIR)"

$(FEEMARKET_DIR)/.git:
	rm -rf "$(FEEMARKET_DIR)"
	git clone --depth 1 --single-branch --branch v1.1.1 \
	  https://github.com/skip-mev/feemarket "$(FEEMARKET_DIR)"

$(GOOGLEAPIS_DIR)/.git:
	rm -rf "$(GOOGLEAPIS_DIR)"
	git clone --depth 1 --single-branch --branch master \
	  https://github.com/googleapis/googleapis "$(GOOGLEAPIS_DIR)"

$(ALLORA_CHAIN_DIR)/.git:
	rm -rf "$(ALLORA_CHAIN_DIR)"
	git clone --depth 1 --single-branch --branch v0.15.1 \
	  https://github.com/allora-network/allora-chain "$(ALLORA_CHAIN_DIR)"

.PHONY: proto-deps
proto-deps: \
  $(GOGOPROTO_DIR)/.git \
  $(COSMOS_PROTO_DIR)/.git \
  $(COSMOS_SDK_DIR)/.git \
  $(FEEMARKET_DIR)/.git \
  $(GOOGLEAPIS_DIR)/.git \
  $(ALLORA_CHAIN_DIR)/.git

.PHONY: proto-deps-update
proto-deps-update:
	git -C "$(GOGOPROTO_DIR)" fetch --depth 1 origin v1.7.0 && git -C "$(GOGOPROTO_DIR)" reset --hard FETCH_HEAD
	git -C "$(COSMOS_PROTO_DIR)" fetch --depth 1 origin v1.0.0-beta.5 && git -C "$(COSMOS_PROTO_DIR)" reset --hard FETCH_HEAD
	git -C "$(COSMOS_SDK_DIR)" fetch --depth 1 origin v0.50.14 && git -C "$(COSMOS_SDK_DIR)" reset --hard FETCH_HEAD
	git -C "$(FEEMARKET_DIR)" fetch --depth 1 origin v1.1.1 && git -C "$(FEEMARKET_DIR)" reset --hard FETCH_HEAD
	git -C "$(GOOGLEAPIS_DIR)" fetch --depth 1 origin master && git -C "$(GOOGLEAPIS_DIR)" reset --hard FETCH_HEAD
	git -C "$(ALLORA_CHAIN_DIR)" fetch --depth 1 origin v0.15.1 && git -C "$(ALLORA_CHAIN_DIR)" reset --hard FETCH_HEAD

# --- Ensure output dirs exist
$(PROTOS_OUT_DIR):
	mkdir -p "$@"

# --- Generate TypeScript from protos
$(PROTO_STAMP): proto-deps | $(PROTOS_OUT_DIR)
	rm -rf "$(PROTOS_OUT_DIR)"
	mkdir -p "$(PROTOS_OUT_DIR)"

	# Generate TypeScript using ts-proto
	# Options match what was used originally - generates service clients
	# Use node to resolve the ts-proto binary path
	npx protoc \
		--plugin=protoc-gen-ts_proto=$$(node -e "console.log(require.resolve('ts-proto/protoc-gen-ts_proto'))") \
		--ts_proto_out="$(PROTOS_OUT_DIR)" \
		--ts_proto_opt=esModuleInterop=true \
		--ts_proto_opt=forceLong=string \
		--ts_proto_opt=outputServices=default \
		--ts_proto_opt=outputClientImpl=true \
		--ts_proto_opt=useExactTypes=false \
		--proto_path="$(ALLORA_CHAIN_DIR)/x/emissions/proto" \
		--proto_path="$(ALLORA_CHAIN_DIR)/x/mint/proto" \
		--proto_path="$(COSMOS_SDK_DIR)/proto" \
		--proto_path="$(COSMOS_PROTO_DIR)/proto" \
		--proto_path="$(FEEMARKET_DIR)/proto" \
		--proto_path="$(GOOGLEAPIS_DIR)" \
		--proto_path="$(GOGOPROTO_DIR)" \
		$$(find "$(ALLORA_CHAIN_DIR)/x/emissions/proto" -type f -name '*.proto') \
		$$(find "$(ALLORA_CHAIN_DIR)/x/mint/proto" -type f -name '*.proto') \
		$$(find "$(COSMOS_SDK_DIR)/proto/cosmos/base" -type f -name '*.proto') \
		$$(find "$(COSMOS_SDK_DIR)/proto/cosmos/bank" -type f -name '*.proto') \
		$$(find "$(COSMOS_SDK_DIR)/proto/cosmos/auth" -type f -name '*.proto') \
		$$(find "$(COSMOS_SDK_DIR)/proto/cosmos/authz" -type f -name '*.proto') \
		$$(find "$(COSMOS_SDK_DIR)/proto/cosmos/circuit" -type f -name '*.proto') \
		$$(find "$(COSMOS_SDK_DIR)/proto/cosmos/consensus" -type f -name '*.proto') \
		$$(find "$(COSMOS_SDK_DIR)/proto/cosmos/distribution" -type f -name '*.proto') \
		$$(find "$(COSMOS_SDK_DIR)/proto/cosmos/evidence" -type f -name '*.proto') \
		$$(find "$(COSMOS_SDK_DIR)/proto/cosmos/feegrant" -type f -name '*.proto') \
		$$(find "$(COSMOS_SDK_DIR)/proto/cosmos/gov" -type f -name '*.proto') \
		$$(find "$(COSMOS_SDK_DIR)/proto/cosmos/mint" -type f -name '*.proto') \
		$$(find "$(COSMOS_SDK_DIR)/proto/cosmos/params" -type f -name '*.proto') \
		$$(find "$(COSMOS_SDK_DIR)/proto/cosmos/slashing" -type f -name '*.proto') \
		$$(find "$(COSMOS_SDK_DIR)/proto/cosmos/staking" -type f -name '*.proto') \
		$$(find "$(COSMOS_SDK_DIR)/proto/cosmos/upgrade" -type f -name '*.proto') \
		$$(find "$(COSMOS_SDK_DIR)/proto/cosmos/tx" -type f -name '*.proto') \
		$$(find "$(FEEMARKET_DIR)/proto/feemarket" -type f -name '*.proto')

	touch "$(PROTO_STAMP)"

.PHONY: proto
proto: $(PROTO_STAMP)

.PHONY: clean
clean:
	rm -rf "$(PROTOS_OUT_DIR)"
	rm -rf "$(PROTO_DEPS)"

.PHONY: clean-proto
clean-proto:
	rm -rf "$(PROTOS_OUT_DIR)"

# --- Build and test
.PHONY: build
build: proto
	yarn build

.PHONY: test
test:
	yarn test:unit
