# Scheduler

## Features

### AAGUID Metadata Fetching

This scheduler is responsible for fetching the metadata of the FIDO Authenticator Attestation GUIDs (AAGUIDs) from the FIDO Official Metadata Service (MDS) and the community-driven list, and then storing/updating them in the database.

- FIDO Official MDS from https://fidoalliance.org/metadata/
- Community-driven List from https://github.com/passkeydeveloper/passkey-authenticator-aaguids

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
cp apps/scheduler/.env.example apps/scheduler/.env
# then edit the .env file
```

- `MONGO_URL`: The MongoDB connection URL.

### Build and Start the Web Application

```bash
yarn scheduler build

# run scheduler
yarn scheduler start
# or run once
yarn scheduler once
```
