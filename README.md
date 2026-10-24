# TrackEd

## Deployment requirements

Before production deployment, the system owner must provide a real privacy contact and verify the ownership or license for `assets/tracked/images/logo.png` and `assets/tracked/images/PSCS.jpg`. These details are intentionally not invented by the application.

The API CORS allowlist is defined in `backend/helpers/response.php` and must be updated if the app is deployed from an origin other than the bundled Flutter WebView or the listed local development origins.

## Telegram message notifications

TrackEd uses Telegram's free Bot API as an optional notification channel. The regular message and its full contents remain in the TrackEd inbox; Telegram receives only a generic “new TrackEd message” alert. Parents must opt in from Messages and start the school bot before notifications can be delivered. SMS is not provided.

1. Create a bot with Telegram's [@BotFather](https://t.me/BotFather).
2. Set `TRACKED_TELEGRAM_BOT_TOKEN`, `TRACKED_TELEGRAM_BOT_USERNAME`, and `TRACKED_TELEGRAM_WEBHOOK_SECRET` in the PHP server environment. If the host does not support environment variables, copy `backend/config/telegram.local.php.example` to the ignored `backend/config/telegram.local.php` and fill in those three values there. Never commit the private file or put the bot token in Flutter or JavaScript.
3. Register `https://tracked.infinityfree.io/api/messages/telegram-webhook` with Telegram's Bot API `setWebhook` method, passing the same webhook secret as `secret_token`.
4. Apply `backend/migrations/20261013_telegram_messaging.sql` to an existing database. Fresh installs already include the Telegram columns in `backend/database.sql`.
5. Parents sign in, open Messages, choose **Connect Telegram**, then start the bot from the one-time link. Links expire after 10 minutes.

Telegram documents the standard free broadcast allowance as up to 30 messages per second. Paid broadcasts are not used by TrackEd.

## Daily assignments

Teachers can post assignments for their assigned class from **Assignments**. Parents see assignments for their linked child’s class. Apply `backend/migrations/20261013_daily_assignments.sql` to an existing database; fresh installs include the assignments table in `backend/database.sql`.

A new Flutter project.

## Getting Started

This project is a starting point for a Flutter application.

A few resources to get you started if this is your first Flutter project:

- [Learn Flutter](https://docs.flutter.dev/get-started/learn-flutter)
- [Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Flutter learning resources](https://docs.flutter.dev/reference/learning-resources)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.
