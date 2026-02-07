import { getAuthConfig, type Env } from './auth';
import { createDigitalOceanClient } from './digitalocean-client';

export type { Env } from './auth';
export type {
  Account,
  Region,
  Size,
  Image,
  Droplet,
  CreateDropletInput,
  Domain,
} from './digitalocean-client';

export default function main(env: Env) {
  const config = getAuthConfig(env);
  return createDigitalOceanClient(config);
}
