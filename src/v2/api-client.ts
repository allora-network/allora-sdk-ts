export enum ChainSlug {
  TESTNET = "testnet",
  MAINNET = "mainnet",
}

export enum ChainID {
  TESTNET = "allora-testnet-1",
  MAINNET = "allora-mainnet-1",
}

export enum PriceInferenceToken {
  BTC = "BTC",
  ETH = "ETH",
}

export enum PriceInferenceTimeframe {
  FIVE_MIN = "5m",
  EIGHT_HOURS = "8h",
}

export enum SignatureFormat {
  ETHEREUM_SEPOLIA = "ethereum-11155111",
}

export interface AlloraAPIClientConfig {
  chainSlug?: ChainSlug;
  apiKey?: string;
  baseAPIUrl?: string;
}

export interface AlloraTopic {
  topic_id: number;
  topic_name: string;
  description?: string | null;
  epoch_length: number;
  ground_truth_lag: number;
  loss_method: string;
  worker_submission_window: number;
  worker_count: number;
  reputer_count: number;
  total_staked_allo: number;
  total_emissions_allo: number;
  is_active: boolean | null;
  updated_at: string;
}

export interface AlloraInferenceData {
  network_inference: string;
  network_inference_normalized: string;
  confidence_interval_percentiles: string[];
  confidence_interval_percentiles_normalized: string[];
  confidence_interval_values: string[];
  confidence_interval_values_normalized: string[];
  topic_id: string;
  timestamp: number;
  extra_data: string;
}

export interface AlloraInference {
  signature: string;
  inference_data: AlloraInferenceData;
}

export interface TopicsResponse {
  topics: AlloraTopic[];
  continuation_token?: string | null;
}

export interface AlloraAPIResponse<T> {
  request_id: string;
  status: boolean;
  apiResponseMessage?: string;
  data: T;
}

type ContinuationToken = string | null | undefined;

export class AlloraAPIClient {
  private readonly apiKey: string;
  private readonly baseAPIUrl: string;
  private readonly chainID: ChainID;

  constructor(config: AlloraAPIClientConfig) {
    this.chainID =
      config.chainSlug === ChainSlug.TESTNET
        ? ChainID.TESTNET
        : ChainID.MAINNET;
    this.apiKey = config.apiKey || "UP-8cbc632a67a84ac1b4078661";
    this.baseAPIUrl = config.baseAPIUrl || "https://api.upshot.xyz/v2";
  }

  /**
   * Fetches all available topics from the Allora API.
   * This method handles pagination automatically by following continuation tokens
   * until all topics have been retrieved.
   *
   * @returns {Promise<AlloraTopic[]>} A promise that resolves to an array of all available topics
   * @throws {Error} If the API request fails or returns an unsuccessful status
   */
  async getAllTopics(): Promise<AlloraTopic[]> {
    const allTopics: AlloraTopic[] = [];
    let continuationToken: ContinuationToken = null;

    do {
      const response = await this.fetchAPIResponse<TopicsResponse>(
        `allora/${this.chainID}/topics`,
      );

      allTopics.push(...response.data.topics);
      continuationToken = response.data.continuation_token;
    } while (continuationToken);

    return allTopics;
  }

  /**
   * Fetches an inference for a specific topic from the Allora API.
   *
   * @param {number} topicID - The unique identifier of the topic to get inference for
   * @returns {Promise<AlloraInference>} A promise that resolves to the inference data
   * @throws {Error} If the API request fails or returns an unsuccessful status
   */
  async getInferenceByTopicID(
    topicID: number,
    signatureFormat: SignatureFormat = SignatureFormat.ETHEREUM_SEPOLIA,
  ): Promise<AlloraInference> {
    const response = await this.fetchAPIResponse<AlloraInference>(
      `allora/consumer/${signatureFormat}?allora_topic_id=${topicID}&inference_value_type=uint256`,
    );

    if (!response.data?.inference_data) {
      throw new Error("Failed to fetch price inference");
    }
    return response.data;
  }

  /**
   * Fetches a price inference for a specific asset and timeframe from the Allora API.
   *
   * @param {PriceInferenceToken} asset - The asset to get price inference for
   * @param {PriceInferenceTimeframe} timeframe - The timeframe to get price inference for
   * @returns {Promise<AlloraInference>} A promise that resolves to the inference data
   * @throws {Error} If the API request fails or returns an unsuccessful status
   */
  async getPriceInference(
    asset: PriceInferenceToken,
    timeframe: PriceInferenceTimeframe,
    signatureFormat: SignatureFormat = SignatureFormat.ETHEREUM_SEPOLIA,
  ): Promise<AlloraInference> {
    const response = await this.fetchAPIResponse<AlloraInference>(
      `allora/consumer/price/${signatureFormat}/${asset}/${timeframe}`,
    );

    if (!response.data?.inference_data) {
      throw new Error("Failed to fetch price inference");
    }
    return response.data;
  }

  getRequestUrl(endpoint: string): string {
    // Remove trailing slash from baseAPIUrl if it exists
    const apiUrl = this.baseAPIUrl.endsWith("/")
      ? this.baseAPIUrl.slice(0, -1)
      : this.baseAPIUrl;

    // Remove leading slash from endpoint if it exists
    endpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;

    return `${apiUrl}/${endpoint}`;
  }

  private async fetchAPIResponse<T>(
    endpoint: string,
  ): Promise<AlloraAPIResponse<T>> {
    const requestUrl = this.getRequestUrl(endpoint);
    const response = await fetch(requestUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
      },
    });
    const responseBody: AlloraAPIResponse<T> = await response.json();

    if (!response.ok) {
      throw new Error(
        `Failed to fetch from Allora API:  url=${requestUrl} status=${response.status} body=${JSON.stringify(responseBody, null, 4)}`,
      );
    }

    return responseBody;
  }
}
