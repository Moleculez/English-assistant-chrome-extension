import type { AnalysisRequest, AnalysisResponse, CEFRLevel } from "../llm/types";

export type { CEFRLevel } from "../llm/types";
export type SourceType = "html" | "pdf";

export interface SelectionContext {
  selectedText: string;
  leftContext: string;
  rightContext: string;
  paragraph: string;
  heading: string;
  pageTitle: string;
  pageUrl: string;
  sourceType: SourceType;
}

export interface AnalyzeRequestMessage {
  type: "ANALYZE_REQUEST";
  payload: SelectionContext;
}

export interface SelectionChangedMessage {
  type: "SELECTION_CHANGED";
  payload: { hasSelection: boolean };
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

export interface RunAnalysisMessage {
  type: "RUN_ANALYSIS";
  payload: AnalysisRequest;
}

export type ExtensionMessage =
  | AnalyzeRequestMessage
  | SelectionChangedMessage
  | AnalysisStartedMessage
  | AnalysisResultMessage
  | AnalysisErrorMessage
  | RetryAnalysisMessage
  | TriggerAnalyzeMessage
  | RunAnalysisMessage;
