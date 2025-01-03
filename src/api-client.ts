export enum ChainSlug {
  TESTNET = "testnet",
  MAINNET = "mainnet",
}

export enum ChainId {
  TESTNET = "allora-testnet-1",
  MAINNET = "allora-mainnet-1",
}

export enum PricePredictionToken {
  BTC = "BTC",
  ETH = "ETH",
}

export enum PricePredictionTimeframe {
  FIVE_MIN = "5m",
  EIGHT_HOURS = "8h",
}

export enum SignatureFormat {
  ETHEREUM_SEPOLIA = "ethereum-11155111",
}

export interface AlloraSDKConfig {
  chainSlug?: ChainSlug;
  apiKey?: string;
  baseApiUrl?: string;
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

export class AlloraApiClient {
  private readonly apiKey: string;
  private readonly baseApiUrl: string;
  private readonly chainId: ChainId;

  constructor(config: AlloraSDKConfig) {
    this.chainId =
      config.chainSlug === ChainSlug.TESTNET
        ? ChainId.TESTNET
        : ChainId.MAINNET;
    this.apiKey = config.apiKey;
    this.baseApiUrl = config.baseApiUrl || "https://api.upshot.xyz/v2";
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
      const response = await this.fetchApiResponse<TopicsResponse>(
        `allora/${this.chainId}/topics`,
      );

      allTopics.push(...response.data.topics);
      continuationToken = response.data.continuation_token;
    } while (continuationToken);

    return allTopics;
  }

  /**
   * Fetches an inference for a specific topic from the Allora API.
   *
   * @param {number} topicId - The unique identifier of the topic to get inference for
   * @returns {Promise<AlloraInference>} A promise that resolves to the inference data
   * @throws {Error} If the API request fails or returns an unsuccessful status
   */
  async getInference(
    topicId: number,
    signatureFormat: SignatureFormat = SignatureFormat.ETHEREUM_SEPOLIA,
  ): Promise<AlloraInference> {
    const response = await this.fetchApiResponse<AlloraInference>(
      `allora/consumer/${signatureFormat}?allora_topic_id=${topicId}&inference_value_type=uint256`,
    );

    return response.data;
  }

  /**
   * Fetches a price prediction for a specific asset and timeframe from the Allora API.
   *
   * @param {PricePredictionToken} asset - The asset to get price prediction for
   * @param {PricePredictionTimeframe} timeframe - The timeframe to get price prediction for
   * @returns {Promise<AlloraInferenceData>} A promise that resolves to the price prediction data
   * @throws {Error} If the API request fails or returns an unsuccessful status
   */
  async getPricePrediction(
    asset: PricePredictionToken,
    timeframe: PricePredictionTimeframe,
    signatureFormat: SignatureFormat = SignatureFormat.ETHEREUM_SEPOLIA,
  ): Promise<AlloraInferenceData> {
    const response = await this.fetchApiResponse<AlloraInference>(
      `allora/consumer/price/${signatureFormat}/${asset}/${timeframe}`,
    );

    if (!response.data?.inference_data) {
      throw new Error(
        `Failed to fetch price prediction. ${response.apiResponseMessage || ""}`,
      );
    }

    return response.data.inference_data;
  }

  private async fetchApiResponse<T>(
    endpoint: string,
  ): Promise<AlloraAPIResponse<T>> {
    // Remove trailing slash from baseApiUrl if it exists
    const apiUrl = this.baseApiUrl.endsWith("/")
      ? this.baseApiUrl.slice(0, -1)
      : this.baseApiUrl;

    // Remove leading slash from endpoint if it exists
    endpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;

    try {
      const response = await fetch(`${apiUrl}/${endpoint}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
        },
      });

      const responseBody: AlloraAPIResponse<T> = await response.json();

      // Handle error responses
      if (!responseBody.status) {
        throw new Error(
          `Failed to fetch from Allora API. ${responseBody.apiResponseMessage || ""}`,
        );
      }

      return responseBody;
    } catch (error) {
      throw new Error(`Failed to fetch from Allora API: ${error.message}`);
    }
  }
}
