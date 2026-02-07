export interface Env {
  DIGITALOCEAN_API_TOKEN: string;
  DIGITALOCEAN_READ_ONLY?: string;
}

export interface AuthConfig {
  apiToken: string;
  readOnly: boolean;
}

export function getAuthConfig(env: Env): AuthConfig {
  if (!env.DIGITALOCEAN_API_TOKEN) {
    throw new Error('Missing DIGITALOCEAN_API_TOKEN in environment.');
  }

  return {
    apiToken: env.DIGITALOCEAN_API_TOKEN,
    readOnly: parseBool(env.DIGITALOCEAN_READ_ONLY),
  };
}

function parseBool(value?: string): boolean {
  if (!value) return false;
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}
