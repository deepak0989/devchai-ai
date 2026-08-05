export interface SpeechRecognitionResultLike {
  isFinal: boolean;
  [index: number]: { transcript: string };
}

export interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

export interface SpeechRecognitionErrorLike {
  error: string;
}

export interface SpeechRecognizer {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorLike) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

export function isSpeechRecognitionSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  );
}

export function createSpeechRecognizer(): SpeechRecognizer | null {
  const Constructor =
    (window as unknown as Record<string, new () => SpeechRecognizer>).SpeechRecognition ??
    (window as unknown as Record<string, new () => SpeechRecognizer>).webkitSpeechRecognition;
  if (!Constructor) return null;

  const recognizer = new Constructor();
  recognizer.lang = 'en-US';
  recognizer.continuous = false;
  recognizer.interimResults = true;
  recognizer.maxAlternatives = 1;
  return recognizer;
}

export function isSpeechSynthesisSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    'SpeechSynthesisUtterance' in window
  );
}

let activeSpeech: { cancelled: boolean } | null = null;

function chunkText(text: string, maxLength = 200): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) ?? [text];
  const chunks: string[] = [];
  let current = '';
  for (const sentence of sentences) {
    if (current.length + sentence.length > maxLength && current.trim()) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter((chunk) => chunk.length > 0);
}

function speakChunk(
  chunks: string[],
  index: number,
  context: { cancelled: boolean }
): void {
  if (context.cancelled || index >= chunks.length) return;
  if (!isSpeechSynthesisSupported()) return;

  const utterance = new SpeechSynthesisUtterance(chunks[index]);
  utterance.lang = 'en-US';
  utterance.rate = 1.05;
  utterance.pitch = 1;

  utterance.onend = () => speakChunk(chunks, index + 1, context);
  utterance.onerror = () => speakChunk(chunks, index + 1, context);
  window.speechSynthesis.speak(utterance);
}

export function speakText(text: string): void {
  if (!isSpeechSynthesisSupported() || !text.trim()) return;

  window.speechSynthesis.cancel();
  const context = { cancelled: false };
  activeSpeech = context;
  speakChunk(chunkText(text), 0, context);
}

export function stopSpeaking(): void {
  if (activeSpeech) {
    activeSpeech.cancelled = true;
    activeSpeech = null;
  }
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}
