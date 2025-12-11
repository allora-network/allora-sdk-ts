import { GeneratedType } from "@cosmjs/proto-signing";
import {
  CreateNewTopicRequest,
  FundTopicRequest,
  RegisterRequest,
  RemoveRegistrationRequest,
  AddStakeRequest,
  RemoveStakeRequest,
  CancelRemoveStakeRequest,
  DelegateStakeRequest,
  RemoveDelegateStakeRequest,
  CancelRemoveDelegateStakeRequest,
  RewardDelegateStakeRequest,
  InsertWorkerPayloadRequest,
  InsertReputerPayloadRequest,
  AddToWhitelistAdminRequest,
  RemoveFromWhitelistAdminRequest,
  AddToGlobalWhitelistRequest,
  RemoveFromGlobalWhitelistRequest,
  AddToGlobalWorkerWhitelistRequest,
  RemoveFromGlobalWorkerWhitelistRequest,
  BulkAddToGlobalWorkerWhitelistRequest,
  BulkRemoveFromGlobalWorkerWhitelistRequest,
  AddToGlobalReputerWhitelistRequest,
  RemoveFromGlobalReputerWhitelistRequest,
  BulkAddToGlobalReputerWhitelistRequest,
  BulkRemoveFromGlobalReputerWhitelistRequest,
  AddToGlobalAdminWhitelistRequest,
  RemoveFromGlobalAdminWhitelistRequest,
  AddToTopicCreatorWhitelistRequest,
  RemoveFromTopicCreatorWhitelistRequest,
  AddToTopicWorkerWhitelistRequest,
  RemoveFromTopicWorkerWhitelistRequest,
  BulkAddToTopicWorkerWhitelistRequest,
  BulkRemoveFromTopicWorkerWhitelistRequest,
  EnableTopicWorkerWhitelistRequest,
  DisableTopicWorkerWhitelistRequest,
  AddToTopicReputerWhitelistRequest,
  RemoveFromTopicReputerWhitelistRequest,
  BulkAddToTopicReputerWhitelistRequest,
  BulkRemoveFromTopicReputerWhitelistRequest,
  EnableTopicReputerWhitelistRequest,
  DisableTopicReputerWhitelistRequest,
} from "./generated/emissions/v9/tx";

export const registryTypes: [string, GeneratedType][] = [
  // Topic management
  [
    "/emissions.v9.CreateNewTopicRequest",
    CreateNewTopicRequest as unknown as GeneratedType,
  ],
  [
    "/emissions.v9.FundTopicRequest",
    FundTopicRequest as unknown as GeneratedType,
  ],

  // Registration
  [
    "/emissions.v9.RegisterRequest",
    RegisterRequest as unknown as GeneratedType,
  ],
  [
    "/emissions.v9.RemoveRegistrationRequest",
    RemoveRegistrationRequest as unknown as GeneratedType,
  ],

  // Staking
  [
    "/emissions.v9.AddStakeRequest",
    AddStakeRequest as unknown as GeneratedType,
  ],
  [
    "/emissions.v9.RemoveStakeRequest",
    RemoveStakeRequest as unknown as GeneratedType,
  ],
  [
    "/emissions.v9.CancelRemoveStakeRequest",
    CancelRemoveStakeRequest as unknown as GeneratedType,
  ],

  // Delegate staking
  [
    "/emissions.v9.DelegateStakeRequest",
    DelegateStakeRequest as unknown as GeneratedType,
  ],
  [
    "/emissions.v9.RemoveDelegateStakeRequest",
    RemoveDelegateStakeRequest as unknown as GeneratedType,
  ],
  [
    "/emissions.v9.CancelRemoveDelegateStakeRequest",
    CancelRemoveDelegateStakeRequest as unknown as GeneratedType,
  ],
  [
    "/emissions.v9.RewardDelegateStakeRequest",
    RewardDelegateStakeRequest as unknown as GeneratedType,
  ],

  // Payload insertion
  [
    "/emissions.v9.InsertWorkerPayloadRequest",
    InsertWorkerPayloadRequest as unknown as GeneratedType,
  ],
  [
    "/emissions.v9.InsertReputerPayloadRequest",
    InsertReputerPayloadRequest as unknown as GeneratedType,
  ],

  // Whitelist admin
  [
    "/emissions.v9.AddToWhitelistAdminRequest",
    AddToWhitelistAdminRequest as unknown as GeneratedType,
  ],
  [
    "/emissions.v9.RemoveFromWhitelistAdminRequest",
    RemoveFromWhitelistAdminRequest as unknown as GeneratedType,
  ],

  // Global whitelist
  [
    "/emissions.v9.AddToGlobalWhitelistRequest",
    AddToGlobalWhitelistRequest as unknown as GeneratedType,
  ],
  [
    "/emissions.v9.RemoveFromGlobalWhitelistRequest",
    RemoveFromGlobalWhitelistRequest as unknown as GeneratedType,
  ],

  // Global worker whitelist
  [
    "/emissions.v9.AddToGlobalWorkerWhitelistRequest",
    AddToGlobalWorkerWhitelistRequest as unknown as GeneratedType,
  ],
  [
    "/emissions.v9.RemoveFromGlobalWorkerWhitelistRequest",
    RemoveFromGlobalWorkerWhitelistRequest as unknown as GeneratedType,
  ],
  [
    "/emissions.v9.BulkAddToGlobalWorkerWhitelistRequest",
    BulkAddToGlobalWorkerWhitelistRequest as unknown as GeneratedType,
  ],
  [
    "/emissions.v9.BulkRemoveFromGlobalWorkerWhitelistRequest",
    BulkRemoveFromGlobalWorkerWhitelistRequest as unknown as GeneratedType,
  ],

  // Global reputer whitelist
  [
    "/emissions.v9.AddToGlobalReputerWhitelistRequest",
    AddToGlobalReputerWhitelistRequest as unknown as GeneratedType,
  ],
  [
    "/emissions.v9.RemoveFromGlobalReputerWhitelistRequest",
    RemoveFromGlobalReputerWhitelistRequest as unknown as GeneratedType,
  ],
  [
    "/emissions.v9.BulkAddToGlobalReputerWhitelistRequest",
    BulkAddToGlobalReputerWhitelistRequest as unknown as GeneratedType,
  ],
  [
    "/emissions.v9.BulkRemoveFromGlobalReputerWhitelistRequest",
    BulkRemoveFromGlobalReputerWhitelistRequest as unknown as GeneratedType,
  ],

  // Global admin whitelist
  [
    "/emissions.v9.AddToGlobalAdminWhitelistRequest",
    AddToGlobalAdminWhitelistRequest as unknown as GeneratedType,
  ],
  [
    "/emissions.v9.RemoveFromGlobalAdminWhitelistRequest",
    RemoveFromGlobalAdminWhitelistRequest as unknown as GeneratedType,
  ],

  // Topic creator whitelist
  [
    "/emissions.v9.AddToTopicCreatorWhitelistRequest",
    AddToTopicCreatorWhitelistRequest as unknown as GeneratedType,
  ],
  [
    "/emissions.v9.RemoveFromTopicCreatorWhitelistRequest",
    RemoveFromTopicCreatorWhitelistRequest as unknown as GeneratedType,
  ],

  // Topic worker whitelist
  [
    "/emissions.v9.AddToTopicWorkerWhitelistRequest",
    AddToTopicWorkerWhitelistRequest as unknown as GeneratedType,
  ],
  [
    "/emissions.v9.RemoveFromTopicWorkerWhitelistRequest",
    RemoveFromTopicWorkerWhitelistRequest as unknown as GeneratedType,
  ],
  [
    "/emissions.v9.BulkAddToTopicWorkerWhitelistRequest",
    BulkAddToTopicWorkerWhitelistRequest as unknown as GeneratedType,
  ],
  [
    "/emissions.v9.BulkRemoveFromTopicWorkerWhitelistRequest",
    BulkRemoveFromTopicWorkerWhitelistRequest as unknown as GeneratedType,
  ],
  [
    "/emissions.v9.EnableTopicWorkerWhitelistRequest",
    EnableTopicWorkerWhitelistRequest as unknown as GeneratedType,
  ],
  [
    "/emissions.v9.DisableTopicWorkerWhitelistRequest",
    DisableTopicWorkerWhitelistRequest as unknown as GeneratedType,
  ],

  // Topic reputer whitelist
  [
    "/emissions.v9.AddToTopicReputerWhitelistRequest",
    AddToTopicReputerWhitelistRequest as unknown as GeneratedType,
  ],
  [
    "/emissions.v9.RemoveFromTopicReputerWhitelistRequest",
    RemoveFromTopicReputerWhitelistRequest as unknown as GeneratedType,
  ],
  [
    "/emissions.v9.BulkAddToTopicReputerWhitelistRequest",
    BulkAddToTopicReputerWhitelistRequest as unknown as GeneratedType,
  ],
  [
    "/emissions.v9.BulkRemoveFromTopicReputerWhitelistRequest",
    BulkRemoveFromTopicReputerWhitelistRequest as unknown as GeneratedType,
  ],
  [
    "/emissions.v9.EnableTopicReputerWhitelistRequest",
    EnableTopicReputerWhitelistRequest as unknown as GeneratedType,
  ],
  [
    "/emissions.v9.DisableTopicReputerWhitelistRequest",
    DisableTopicReputerWhitelistRequest as unknown as GeneratedType,
  ],
];
