// DI tokens for the queue integrations. Each token resolves to a BullMQ
// Queue created in-process; the actual workers (services/notifier,
// services/ocr-pipeline) run as separate processes that read from Redis.

export const NOTIFIER_QUEUE_TOKEN = "NOTIFIER_QUEUE";
export const ALERT_QUEUE = "notifications";

export const OCR_QUEUE_TOKEN = "OCR_QUEUE";
export const OCR_QUEUE = "ocr-extraction";
