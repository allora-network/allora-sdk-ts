import { SigningStargateClient } from "@cosmjs/stargate";

export abstract class BaseModule<QueryServiceType> {
  constructor(
    protected readonly queryService: QueryServiceType,
    protected readonly signingStargateClient?: SigningStargateClient | null,
  ) {}

  protected assertSigningClient(): SigningStargateClient {
    if (!this.signingStargateClient) {
      throw new Error(
        "Signing client not available. Ensure signer is provided.",
      );
    }
    return this.signingStargateClient;
  }

  public get signingClient(): SigningStargateClient {
    return this.assertSigningClient();
  }
}
