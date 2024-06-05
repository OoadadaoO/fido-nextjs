# FIDOG

A web application with FIDO2 authentication.

## Features

### FIDO2 Authentication

This web application supports FIDO2 authentication. You can register and login with your FIDO2 authenticator, like Google Password Manager on Android, Apple Touch ID on iOS, Windows Hello on Windows, or hardware security keys like YubiKey. Moreover, you can login "usernameless".

### Credential Management

This web application supports credential management. You can manage your FIDO2 credentials, like adding, removing, and listing them. This feature is useful when you want to manage your FIDO2 credentials, when you lost your authenticator, or when you want to keep the available redundancy of your authenticators.

## Getting Started

> All the command below should be executed in the root of this repo.

### Prerequisites

- Node.js v20
- Yarn v1.22

> If you have not installed Node.js and Yarn or have any problem with versioning, you can install them by following this [Guide to Installation](https://adada1024.notion.site/NodeJs-f9a83de221e64e46ba930a62246f2256).

### Install the Dependencies

```bash
yarn install --frozen-lockfile
# or you want to update the dependencies (might cause unmet dependencies)
yarn install
```

### Configure the Environment Variables

```bash
cp apps/web/.env.example apps/web/.env.local
# then edit the .env.local file
```

- `MONGO_URL`: The MongoDB connection URL.

- `AUTH_SECRET`: The secret key for JWT. You can generate it by `openssl rand -base64 32`.
- `AUTH_EXPIRES`: The expiration time for JWT. e.g. 1d, 1h, 1m (support s, m, h, d, w).
- `AUTH_ACTIVE_EXTEND`: The time to extend the expiration time for JWT when the user is active. e.g. 5m, 10m, 30m (support s, m, h, d, w).

- `NEXT_PUBLIC_BASE_URL`: The base URL of the web application.
- `NEXT_PUBLIC_RP_ID`: The Relying Party ID for FIDO2 authentication.

### Build and Start the Web Application

```bash
yarn web build
yarn web start
```

It will start the web application on http://localhost:3000. You can custom the port by add flag `--port <port>` to the start command. Do not forget to change the `NEXT_PUBLIC_BASE_URL` in the `.env.local` file if needed.
