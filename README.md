# @kazibee/digitalocean

DigitalOcean tool for kazibee. Supports account discovery, droplets, images, regions, sizes, and domains.

## Install

In the Kazibee desktop app, open **Settings → Tools → Add Extension → Install** and enter
`github:kazibee/digitalocean`. The app clones the latest commit and records its SHA; use
**Update** on the extension to move to a newer commit.

## Authentication

Set these in **Settings → Tools → digitalocean → Environment**:

- `DIGITALOCEAN_API_TOKEN` (required)
- `DIGITALOCEAN_READ_ONLY=true` (optional safety mode)

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
