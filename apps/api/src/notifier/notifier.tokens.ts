// DI tokens for the notifier integration. Lives in apps/api so the BullMQ
// queue can be created in-process and shared with the worker via Redis.

export const NOTIFIER_QUEUE_TOKEN = "NOTIFIER_QUEUE";
export const ALERT_QUEUE = "notifications";
