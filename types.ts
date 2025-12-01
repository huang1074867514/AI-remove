export interface ProcessedImage {
  originalUrl: string;
  processedUrl: string | null;
  fileName: string;
  mimeType: string;
}

export enum AppState {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface ProcessingOptions {
  prompt: string;
}