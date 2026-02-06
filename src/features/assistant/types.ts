export type AssistantMessage = {
  id: string;
  role: "user" | "assistant";
  text?: string;
  imageUrl?: string;
  parsed?: ParsedExpense;
  items?: ParsedExpense[];
  missing?: string[];
  status?: "streaming" | "done";
  savedId?: string;
  savedItemIds?: string[];
};

export type ParsedExpense = {
  type?: "expense" | "income";
  amount?: number;
  currency?: string;
  date?: string;
  category?: string;
  title?: string;
  description?: string;
  tag?: string;
};

export type ContextMessage = {
  role: "user" | "assistant";
  text: string;
};

export type StreamEvent = {
  type: "reply_delta" | "draft" | "done" | "error" | "final";
  delta?: string;
  reply?: string;
  parsed?: ParsedExpense;
  items?: ParsedExpense[];
  missing?: string[];
  message?: string;
};

export type SpeechRecognitionAlternativeLike = {
  transcript: string;
};

export type SpeechRecognitionResultLike = {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternativeLike;
};

export type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
};

export type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

export type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};
