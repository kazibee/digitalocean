export interface LoginResult {
  DIGITALOCEAN_API_TOKEN: string;
  DIGITALOCEAN_READ_ONLY?: string;
}

/**
 * DigitalOcean uses personal access tokens. There is no browser OAuth flow.
 *
 * Set env vars directly:
 * - DIGITALOCEAN_API_TOKEN
 * - DIGITALOCEAN_READ_ONLY=true (optional safety mode)
 */
export async function login(): Promise<LoginResult> {
  throw new Error(
    'DigitalOcean does not support browser login here. Set DIGITALOCEAN_API_TOKEN directly. ' +
      'Optionally set DIGITALOCEAN_READ_ONLY=true.',
  );
}
