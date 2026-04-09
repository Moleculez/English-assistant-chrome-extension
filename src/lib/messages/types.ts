import type { AnalysisResponse, CEFRLevel } from "../llm/types";

export type { CEFRLevel };

export interface AnalysisStartedMessage {
  type: "ANALYSIS_STARTED";
  payload: { selectedText: string };
}

export interface AnalysisResultMessage {
  type: "ANALYSIS_RESULT";
  payload: AnalysisResponse;
}

export interface AnalysisErrorMessage {
  type: "ANALYSIS_ERROR";
  payload: { error: string; retryable: boolean };
}

export interface RetryAnalysisMessage {
  type: "RETRY_ANALYSIS";
  payload: { level: CEFRLevel };
}
