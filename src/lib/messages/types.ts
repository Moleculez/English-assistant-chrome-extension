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

export interface TriggerAnalyzeMessage {
  type: "TRIGGER_ANALYZE";
}
