# TrackEd Laravel API

This is the Laravel REST API used by the native Flutter app. It remains
separate from the legacy PHP API in `../backend`; the Flutter client connects
to this API using its configured `TRACKED_API_BASE_URL`.

## Requirements

- PHP 8.3 or later with `openssl`, `sodium`, `mbstring`, `fileinfo`, and
  `pdo_mysql`
- Composer 2
- A MySQL database created for this Laravel instance. The existing PHP API
  uses a hosted MySQL service, but this Laravel API must use a separate,
  initially empty database.

## Prepare a separate hosted MySQL database

1. In the MySQL provider console, create a **new database/schema** named
   `tracked_app_laravel`. Do not reuse the existing `tracked_app` schema.
2. Confirm that the Laravel hosting environment can connect to the database:
   allow its outbound connection if the provider uses an IP allowlist.
3. Keep the database host, port, name, username, password, and TLS CA
   certificate private. Do not send them in chat or commit them to Git.

## Local setup

1. Install the PHP dependencies:

   ```sh
   composer install
   ```

2. Copy `.env.example` to `.env` if `.env` does not already exist.
3. Set `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD`
   to the new database connection values in `.env`. Keep
   `DB_DATABASE=tracked_app_laravel` if that is the schema name you created.
   For a hosted database that requires TLS, save its CA certificate outside
   the repository and set `MYSQL_ATTR_SSL_CA` to that local certificate path.
4. Generate an application key and apply the Laravel migrations:

   ```sh
   php artisan key:generate
   php artisan migrate
   ```

5. Start the API:

   ```sh
   php artisan serve
   ```

6. Check `http://127.0.0.1:8000/api/` and
   `http://127.0.0.1:8000/api/health`.

The health endpoint runs a small database query and returns HTTP `503` without
exposing connection details if MySQL is unavailable.

## Email-verified password reset

The app emails a one-time reset code to the account address. Configure a
transactional SMTP sender in Render's environment settings. For Gmail, set
`MAIL_MAILER=smtp`, `MAIL_HOST=smtp.gmail.com`, `MAIL_PORT=587`,
`MAIL_SCHEME=smtp`, `MAIL_USERNAME` and `MAIL_FROM_ADDRESS` to the sending
Gmail address, and `MAIL_PASSWORD` to a Google App Password (not the normal
account password). Enable 2-Step Verification before creating an App Password.
Set `MAIL_FROM_NAME=TrackEd`. Keep all mail credentials out of source control.
Codes expire after 10 minutes and allow at most five verification attempts.

## Local demo accounts

The demo seeder is disabled by default and refuses to seed unless
`APP_ENV=local` and `TRACKED_SEED_DEMO_DATA=true`. For local development only,
set those values in `.env`, then run `php artisan db:seed`. It creates:

| Role | Email |
|---|---|
| Grade 1 teacher | `teacher@tracked.edu` |
| Grade 2 teacher | `preyes@tracked.edu` |
| Grade 3 teacher | `clim@tracked.edu` |
| Parent (Grade 1) | `lreyes@gmail.com` |
| Parent (Grade 2) | `cgomez@gmail.com` |
| Parent (Grade 3) | `parent@gmail.com` |
| Admin / principal | `admin@tracked.edu` |

The local demo password defaults to `password123`; optionally override it with
`TRACKED_DEMO_PASSWORD`. These shared demo credentials are for local testing
only. Never enable the demo seeder in production or expose these accounts on a
public API. The seeder also adds one linked student per grade and sample class,
grade, and attendance records.

## Create the first production admin without Shell access

The Render entrypoint can create one initial admin during service startup.
This is useful on plans without Render Shell access:

1. Deploy the Laravel API code that includes `InitialAdminSeeder`.
2. In Render, open the Laravel API service's **Environment** settings and add:
   `TRACKED_INITIAL_ADMIN_NAME`, `TRACKED_INITIAL_ADMIN_EMAIL`, and
   `TRACKED_INITIAL_ADMIN_PASSWORD`. Use a unique email and a strong password
   of at least 12 characters. Keep the password in Render's secret environment
   settings; do not commit it or send it in chat.
3. Save the settings and trigger a deploy/restart. The entrypoint creates the
   admin only if no admin exists. It will not overwrite an existing account.
   If the configured email belongs to another account, startup fails instead
   of changing that account.
4. After the deploy succeeds, remove all three `TRACKED_INITIAL_ADMIN_*`
   settings from Render and save. Removing them prevents the bootstrap
   operation from running again.
5. Sign in with the configured admin email and password, then create teacher
   accounts in the app.

If the service cannot reach its database during startup, the deployment fails
and does not create the account. Do not enable the demo seeder in production.

## Local migration verification (2026-10-29)

The configured local Laravel connection was verified as MySQL and confirmed to
target the separate `tracked_app_laravel` schema. The connection passed `SELECT
1`, Laravel reported all then-current migrations as applied, and `GET /api/health`
returned HTTP `200` with `{"status":"ok","database":"connected"}`. This verifies
the current local configuration only; it does not verify production hosting or
the mobile app's connection to Laravel.

## API authentication and middleware

- Public authentication endpoints are `POST /api/auth/login` and
  `POST /api/auth/forgot-password`. Login is limited to five attempts per
  minute for each email/IP pair.
- Forgot Password creates a one-time reset token and emails a link to
  `/reset-password/{token}`. The page submits the new password to
  `POST /api/auth/reset-password`; links expire after 60 minutes and can only
  be used once. Configure `APP_URL` to the public HTTPS Laravel URL and set
  the SMTP `MAIL_*` values below before expecting users to receive reset
  emails. The API intentionally returns the same response for existing and
  unknown email addresses. Password reset mail is sent by Laravel's mail
  transport directly, so it does not require the queue worker.
- Login returns a Sanctum bearer token. Send it on later requests as
  `Authorization: Bearer <token>`. Tokens expire after seven days by default;
  adjust `SANCTUM_TOKEN_EXPIRATION` in the secret environment if needed.
- `POST /api/auth/logout`, `GET /api/me`, and `PATCH /api/me` require a valid
  bearer token. Logout revokes the current token.
- Register role-protected API routes behind both `auth:sanctum` and the `role`
  middleware, for example:

  ```php
  Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
      // Admin-only routes
  });
  ```

### Academic and communication features

- Teachers and administrators can post announcements. Teachers can edit or
  delete only announcements they created; administrators can manage all
  announcements. Audience, category, priority, and pin state are saved by the
  API.
- Teachers can post, edit, and delete their own assignments or student
  projects. Parents see only posts for their child's class.
- Messages are checked for participant access and a teacher can message only
  parents linked to their students. The app checks for new messages once per
  second while the inbox is open; `GET /api/messages?after=<id>` returns only
  newer messages so teacher-parent and teacher-principal conversations refresh
  without reloading the inbox.
- Admin class-performance reports show a separate grade-level table with the
  subjects for that grade. The downloadable performance report is a single PDF
  with a separate table/page for each grade; CSV export is not offered there.
- Grade descriptions are separate teacher observations saved by quarter
  (`Q1`–`Q3`). Teachers can save observations only for their assigned students;
  parents and administrators can read observations within their student scope.
- The Flutter grade-entry view uses `Q1`, `Q2`, `Q3`, and a computed final
  grade. It does not expose a `Q4` entry.

The migration `2026_10_31_000000_add_announcement_assignment_and_grade_descriptions`
adds the fields and table required by these features. Apply migrations only
after verifying that Laravel is configured for the separate
`tracked_app_laravel` database, and apply the migration to the hosted API
database as part of deployment.

- CORS is restricted by `TRACKED_CORS_ALLOWED_ORIGINS`; configure the exact
  production app origins in the hosting provider's environment settings.
- API validation failures return HTTP `422` with `error` and `errors` fields.
  Authentication and authorization failures return the legacy-compatible
  `{"error":"..."}` shape.

After local verification, add the same settings to the Laravel hosting
provider's **secret environment variables** and provide the CA certificate
through its supported secure file/secret mechanism. Do not put credentials in
Flutter, JavaScript, Git, screenshots, or chat messages.

## Database safety

Do not point this Laravel app at the existing `tracked_app` database. Its
tables are already managed by the PHP backend, and the Laravel migrations
create a parallel schema. Run migrations only against the new, blank
`tracked_app_laravel` database until a reviewed data migration and cutover plan
is ready. Keep `.env`, CA certificates, and all database credentials out of
source control.

## Push-notification integration status

The authenticated `POST /api/devices` and owner-only
`DELETE /api/devices/{id}` endpoints store and remove device registrations.
The Flutter Android app initializes Firebase Messaging, requests notification
permission after sign-in, receives foreground messages, and registers its FCM
registration token with Laravel's authenticated `/devices` endpoint. It uses
the token API because FCM HTTP v1 targets registration tokens; it does not send
the Firebase Installation ID.

Laravel now queues an FCM push to a parent's registered devices when it saves
a new failing-grade alert. The message is stored before the push is queued, so
delivery failure does not remove the in-app alert. The worker retries delivery
and records exhausted jobs in Laravel's failed-job store.

Before enabling delivery in the hosted environment:

1. Create a Firebase service account with the Firebase Cloud Messaging Admin
   role for the TrackEd Firebase project.
2. Store its JSON key using the host's secret-file mechanism. Set
   `FIREBASE_CREDENTIALS` to the private file path in the Laravel environment.
   Do not paste the key into chat, commit it, or put it in Flutter or JavaScript.
3. Ensure the hosting PHP runtime has the `sodium` extension and run a Laravel
   queue worker for the `default` queue.
4. Configure the Flutter app's `TRACKED_API_BASE_URL` to this Laravel API.

Firebase client configuration is local-only and ignored by Git. iOS Firebase
configuration is not yet set up. Laravel queues an email to the linked parent
when it creates a new failing-grade alert. Configure the Laravel host's secret
environment with the SMTP provider's `MAIL_MAILER=smtp`, `MAIL_SCHEME`,
`MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`,
`MAIL_FROM_ADDRESS`, and `MAIL_FROM_NAME` values. Keep `MAIL_PASSWORD` only in
the hosting provider's secret settings; do not put SMTP credentials in Flutter,
the web client, or Git. The default `MAIL_MAILER=log` in local/deployment
examples does not deliver email; switch it to `smtp` after the provider is
configured. Ensure the Laravel queue worker is running to process email and
push jobs.

The password-reset email uses the same SMTP settings but is sent directly
through Laravel's mail transport. A running queue worker is not needed for
password resets. With `MAIL_MAILER=log`, reset messages are written to the
Laravel log instead of being delivered to the account's inbox.

## Render deployment preparation

The `Dockerfile` builds this Laravel API on PHP 8.3 with Apache, `pdo_mysql`,
and `sodium`. The Apache document root is `public/`, and the container listens
on Render's assigned `PORT`. `.dockerignore` excludes local environment files,
dependencies, and the Firebase secret-file names used by this setup.

The deployment repository is
`https://github.com/DeliaPortes/tracked-app-vercel.git`, branch `main`.
Because Laravel is in a monorepo subdirectory, set the Render service's
**Root Directory** to `backend-laravel`. Render resolves the Dockerfile and
build context relative to that directory.

Create two Render services from that GitHub repository and branch:

1. **Web Service**: choose Docker, set the Dockerfile path to
   `Dockerfile`, and use `/api/health` as the health-check
   path. Set `APP_ENV=production`, `APP_DEBUG=false`, `DB_CONNECTION=mysql`,
   `QUEUE_CONNECTION=database`, `MAIL_MAILER=log`, `LOG_CHANNEL=stderr`, and
   `APP_KEY` plus the MySQL settings in the Render environment. Use a distinct,
   empty Laravel schema; do not point this deployment at the legacy PHP
   schema.
2. **Background Worker**: choose Docker, use the same Dockerfile, and set the
   start command to
   `php artisan queue:work database --sleep=3 --tries=3 --timeout=80`.
   Give it the same Laravel application key and database settings as the web
   service.
3. Configure the Firebase JSON key as a Render **secret file** named
   `tracked-firebase-service-account.json`. Set
   `FIREBASE_CREDENTIALS=/etc/secrets/tracked-firebase-service-account.json`
   for the worker service. Do not commit the key or paste it into an ordinary
   environment variable.
4. Ensure the hosting PHP image has the `sodium` extension and keep the queue
   worker running. Do not run `php artisan migrate --force` until you have
   confirmed the connection targets the separate, empty Laravel schema.

Render's web and background worker are separate billable services; review the
current plan and price in the Render dashboard before creating either service.
The deployment is not live or connected to Firebase until these dashboard
steps are completed. Do not share the database values, `APP_KEY`, or Firebase
key in chat.

The `/api/health` check executes `SELECT 1`; HTTP `503` means Laravel cannot
connect to MySQL, not that migrations are missing. For an Aiven database,
confirm the service is running, use its public hostname and port, and allow
connections from the Render service's outbound IP addresses if Aiven access
control is enabled. Aiven's connection page may show `defaultdb`; create
`tracked_app_laravel` under **Connect > Databases** before using that name for
`DB_DATABASE`, or set `DB_DATABASE` to the exact database name that already
exists. The Render `DB_HOST` and `DB_PORT` must match Aiven's hostname and
port.

Aiven requires TLS. Add the Aiven CA certificate as a Render secret file and
set `MYSQL_ATTR_SSL_CA` to its exact mounted file path on the web service (and
worker). Set `LOG_CHANNEL=stderr` on the web service so the database
connection error appears in Render's application logs. Never include
database credentials or certificate contents in shared logs or chat.
