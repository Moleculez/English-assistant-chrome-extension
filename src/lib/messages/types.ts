import type { AnalysisResponse, CEFRLevel, SourceType } from "../llm/types";

export type { CEFRLevel, SourceType };

export interface AnalyzeRequestMessage {
  type: "ANALYZE_REQUEST";
  payload: {
    selectedText: string;
    leftContext: string;
    rightContext: string;
    paragraph: string;
    heading: string;
    pageTitle: string;
    pageUrl: string;
    sourceType: SourceType;
  };
}

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

export interface TriggerAnalyzeMessage {
  type: "TRIGGER_ANALYZE";
}

export type ExtensionMessage =
  | AnalyzeRequestMessage
  | AnalysisStartedMessage
  | AnalysisResultMessage
  | AnalysisErrorMessage
  | RetryAnalysisMessage
  | TriggerAnalyzeMessage;
