# Tärpistö

Actually new exam archive. And a little bit more.

## Table of contents

- [Development](#development)
  - [Quick guide](#quick-guide)
  - [Other good to know commands](#other-good-to-know-commands)
  - [Needed tools and dependencies](#needed-tools-and-dependencies)
  - [Adding more test files](#adding-more-test-files)
  - [Seeding database with real data](#seeding-database-with-real-data)
- [Docker warning](#docker-warning)
- [Environment variables](#environment-variables)
- [License](#license)

## Development

### Quick guide

1. Run `start-local-env.sh`. This will set up development environment and runs all needed commands. Script will also tell if you are missing some tooling listed below.
2. _(OPTIONAL)_ If you want to test with realish users, set up `user-service` and make sure that there's a service for Tärpistö, might need to change the permission bits to `770`. By default, the service will just skip authentication and log you in. If local user service cookie is detected, Tärpistö tries to authenticate against it.
3. Then go to <http://127.0.0.1:9000>

### Other good to know commands

- `run-local-prod.sh` will start prod-like environment locally for testing Docker image. There is `APP_ENV=development` enabled for bypassing user service authentication.
- `run-security-scan.sh` runs ZAProxy's zap-full-scan.py against app. Mainly used in CI, but also working locally.
- `run-tests.sh` runs Playwright test suite against app.
- `seed-dev-db.sh` runs database seeds against local development database. Only needed if you want to have some development test data. Tests handles seeding itself.

### Needed tools and dependencies

- docker and docker-compose
- tmux
- curl
- shasum
- jq
- npm (start-local-env.sh will take care of this with nvm)
- Prettier formatter extension for your editor

### Adding more test files

By default, the local minio s3 is seeded with one PDF and one JPG. You can just upload more files, or see `docker/minio.Dockerfile` and `docker/minio-docker-entrypoint.sh` for how to add more files the Minio image we build. If you add a file, you can then modify `seeds/exams.js` with the correct file name. Make the file an uuidv4 or something.

### Seeding database with real data

1. Run `seed-dev-db.sh`. This will handle seeding development database with real-like data. All test processes handles this process itself and is not dependant of development database.

## Docker warning

The `.dockerignore` is configured to work as a whitelist so if you add new files or folders which you want to include in the Docker image, update [`.dockerignore`](https://github.com/TKOaly/exam-archive-new/blob/master/.dockerignore).

## Environment variables

| Key                       | Value                                                                                                                                                                                               | Needed for                   | Example                                                                                 |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------- |
| `PORT`                    | Port where Next.js app process will be running                                                                                                                                                      | App                          | `9000` for dev, `9010` for tests, `9020` for security tests, `9030` for local prod-like |
| `NODE_ENV`                | NODE_ENV tells Next.js in which kind of environment app is runned. `development` is enforced in dev and `production` is enforced in prod.                                                           | App                          | `development` for dev, `production` for prod                                            |
| `APP_ENV`                 | APP_ENV defines if selected app functions allowed in current environment. For example this is used to limit `/admin` to dev only. Created because Next.js enforces NODE_ENV values in dev and prod. | App                          | `development` for dev, `production` for prod                                            |
| `PG_CONNECTION_STRING`    | Database connection string                                                                                                                                                                          | Storing course and exam info | `postgresql://tarpisto:tarpisto@tarpisto:5432/tarpisto`                                 |
| `USER_SERVICE_SERVICE_ID` | The UUID that you've assigned to this service in `user-service`                                                                                                                                     | Logging in, auth             | `11188b9c-9534-4faf-8355-60973b720647`                                                  |
| `USER_SERVICE_URL`        | The address of the user service                                                                                                                                                                     | Logging in, auth             | `http://127.0.0.1:8080`                                                                 |
| `USER_SERVICE_SECRET`     | The secret value that you've assigned to this service in `user-service`.                                                                                                                            | Logging in, auth             | `catlike-meringue-tying-PASTERN-bed-simply`                                             |
| `NEXTAUTH_URL`            | The url for current deployment environment. Used for callback url inside the NextAuth.                                                                                                              | Logging in, auth             | `http://127.0.0.1:9000`                                                                 |
| `NEXTAUTH_SECRET`         | The secret value that is used to sign NextAuth JWT cookies.                                                                                                                                         | Logging in, auth             | `catlike-meringue-tying-PASTERN-bed-simply`                                             |
| `AWS_REGION`              | Used AWS region where resources are                                                                                                                                                                 | Storing exam files           | `eu-west-1`                                                                             |
| `AWS_ACCESS_KEY_ID`       | Your AWS access key's ID                                                                                                                                                                            | Storing exam files           | `tarpisto`                                                                              |
| `AWS_SECRET_ACCESS_KEY`   | Your AWS secret access key                                                                                                                                                                          | Storing exam files           | `tarpisto`                                                                              |
| `AWS_S3_ENDPOINT`         | Url used to communicate with S3                                                                                                                                                                     | Storing exam files           | `http://s3:9000`                                                                        |
| `AWS_S3_BUCKET_ID`        | ID of used S3 bucket                                                                                                                                                                                | Storing exam files           | `tarpisto-local`                                                                        |
| `OTEL_SERVICE_NAME`       | Service name used when handling OpenTelemetry logs                                                                                                                                                  | Logging                      | `tarpisto`                                                                              |
| `OTEL_ENDPOINT`           | Endpoint used to sent OpenTelemetry logs                                                                                                                                                            | Logging                      | `http://opentelemetryendpoint`                                                          |
| `OTEL_AUTHORIZATION`      | Authorization key used to sent OpenTelemetry logs                                                                                                                                                   | Logging                      | `authorizationkey`                                                                      |

## License

MIT, see LICENSE file for details.
