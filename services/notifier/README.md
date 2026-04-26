# services/notifier

Worker that drains the `notifications` queue and dispatches push (APNs / FCM) and email (SES).

## Resilience contract

- **Independent process** from the API. Notifier crashes do not affect API.
- **Retries**: 5 attempts with exponential backoff (1m, 2m, 4m, 8m, 16m).
- **Failure absorbed**: in-app inbox always receives the message immediately on `alert.queued → sent`. Push is best-effort secondary.
- **Push payload**: contains zero medical content. See `docs/04 §8`.
- **No outbound circuit breakers yet** (Sprint-0); add them when wiring real APNs/FCM/SES.
