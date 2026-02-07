# @kazibee/digitalocean

DigitalOcean tool for kazibee. Supports account discovery, droplets, images, regions, sizes, and domains.

## Install

```bash
kazibee install digitalocean github:kazibee/digitalocean
```

Install globally with `-g`:

```bash
kazibee install -g digitalocean github:kazibee/digitalocean
```

## Authentication

Set environment variables:

- `DIGITALOCEAN_API_TOKEN` (required)
- `DIGITALOCEAN_READ_ONLY=true` (optional safety mode)

Recommended with kazibee `--env`:

```bash
kazibee --env DIGITALOCEAN_API_TOKEN=do_xxx --env DIGITALOCEAN_READ_ONLY=true
```

## Read-only Safety

- `isReadOnly()` returns whether mutation endpoints are blocked.
- Mutating methods throw when read-only mode is enabled.

## API

- `isReadOnly()`
- `getAccount()`
- `listRegions()`
- `listSizes()`
- `listImages(type?, perPage?)`
- `listDroplets(page?, perPage?)`
- `getDroplet(dropletId)`
- `createDroplet(input)`
- `deleteDroplet(dropletId)`
- `listDomains()`
- `createDomain(name, ipAddress)`
- `deleteDomain(name)`
