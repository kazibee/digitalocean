import type { AuthConfig } from './auth';

const BASE_URL = 'https://api.digitalocean.com/v2';

export interface Account {
  email: string;
  uuid: string;
  emailVerified: boolean;
  dropletLimit: number;
  floatingIpLimit: number;
  status: string;
}

export interface Region {
  slug: string;
  name: string;
  available: boolean;
  features: string[];
}

export interface Size {
  slug: string;
  memory: number;
  vcpus: number;
  disk: number;
  transfer: number;
  priceMonthly: number;
  regions: string[];
  available: boolean;
}

export interface Image {
  id: number;
  name: string;
  distribution: string;
  slug: string | null;
  public: boolean;
  type: string;
}

export interface Droplet {
  id: number;
  name: string;
  memory: number;
  vcpus: number;
  disk: number;
  status: string;
  createdAt: string;
  region: { slug: string; name: string };
  image: { id: number; name: string; distribution: string; slug: string | null };
}

export interface CreateDropletInput {
  name: string;
  region: string;
  size: string;
  image: string | number;
  sshKeys?: Array<string | number>;
  backups?: boolean;
  ipv6?: boolean;
  monitoring?: boolean;
  tags?: string[];
}

export interface Domain {
  name: string;
  ttl: number;
  zoneFile: string;
}

export function createDigitalOceanClient(config: AuthConfig) {
  const request = createRequest(config.apiToken);

  return {
    /** Returns whether the client is currently in read-only mode. */
    isReadOnly: () => config.readOnly,

    /** Returns account details for the token owner. */
    getAccount: () => getAccount(request),

    /** Lists available regions. */
    listRegions: () => listRegions(request),

    /** Lists available droplet sizes. */
    listSizes: () => listSizes(request),

    /** Lists available images. */
    listImages: (type?: 'distribution' | 'application', perPage?: number) =>
      listImages(request, type, perPage),

    /** Lists droplets for the account. */
    listDroplets: (page?: number, perPage?: number) => listDroplets(request, page, perPage),

    /** Gets one droplet by ID. */
    getDroplet: (dropletId: number) => getDroplet(request, dropletId),

    /** Creates a new droplet. Blocked in read-only mode. */
    createDroplet: (input: CreateDropletInput) =>
      createDroplet(request, config.readOnly, input),

    /** Deletes a droplet by ID. Blocked in read-only mode. */
    deleteDroplet: (dropletId: number) => deleteDroplet(request, config.readOnly, dropletId),

    /** Lists domains. */
    listDomains: () => listDomains(request),

    /** Creates a domain. Blocked in read-only mode. */
    createDomain: (name: string, ipAddress: string) =>
      createDomain(request, config.readOnly, name, ipAddress),

    /** Deletes a domain. Blocked in read-only mode. */
    deleteDomain: (name: string) => deleteDomain(request, config.readOnly, name),
  };
}

type RequestFn = <T>(path: string, init?: RequestInit) => Promise<T>;

function createRequest(apiToken: string): RequestFn {
  return async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });

    if (!res.ok) {
      const body = await safeParse(res);
      const detail = typeof body === 'string' ? body : JSON.stringify(body);
      throw new Error(`DigitalOcean API ${res.status}: ${detail}`);
    }

    if (res.status === 204) {
      return undefined as T;
    }

    return (await res.json()) as T;
  };
}

async function safeParse(res: Response): Promise<unknown> {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function ensureWritable(readOnly: boolean): void {
  if (readOnly) {
    throw new Error(
      'This DigitalOcean client is in read-only mode (DIGITALOCEAN_READ_ONLY=true). ' +
        'Disable read-only mode to perform mutations.',
    );
  }
}

async function getAccount(request: RequestFn): Promise<Account> {
  const data = await request<{ account: any }>('/account');
  return {
    email: data.account.email,
    uuid: data.account.uuid,
    emailVerified: data.account.email_verified,
    dropletLimit: data.account.droplet_limit,
    floatingIpLimit: data.account.floating_ip_limit,
    status: data.account.status,
  };
}

async function listRegions(request: RequestFn): Promise<Region[]> {
  const data = await request<{ regions: any[] }>('/regions');
  return data.regions.map((r) => ({
    slug: r.slug,
    name: r.name,
    available: r.available,
    features: r.features ?? [],
  }));
}

async function listSizes(request: RequestFn): Promise<Size[]> {
  const data = await request<{ sizes: any[] }>('/sizes');
  return data.sizes.map((s) => ({
    slug: s.slug,
    memory: s.memory,
    vcpus: s.vcpus,
    disk: s.disk,
    transfer: s.transfer,
    priceMonthly: s.price_monthly,
    regions: s.regions ?? [],
    available: s.available,
  }));
}

async function listImages(
  request: RequestFn,
  type?: 'distribution' | 'application',
  perPage = 25,
): Promise<Image[]> {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  params.set('per_page', String(perPage));

  const data = await request<{ images: any[] }>(`/images?${params.toString()}`);
  return data.images.map((i) => ({
    id: i.id,
    name: i.name,
    distribution: i.distribution,
    slug: i.slug ?? null,
    public: i.public,
    type: i.type,
  }));
}

async function listDroplets(
  request: RequestFn,
  page = 1,
  perPage = 25,
): Promise<Droplet[]> {
  const data = await request<{ droplets: any[] }>(
    `/droplets?page=${page}&per_page=${perPage}`,
  );
  return data.droplets.map(mapDroplet);
}

async function getDroplet(request: RequestFn, dropletId: number): Promise<Droplet> {
  const data = await request<{ droplet: any }>(`/droplets/${dropletId}`);
  return mapDroplet(data.droplet);
}

async function createDroplet(
  request: RequestFn,
  readOnly: boolean,
  input: CreateDropletInput,
): Promise<Droplet> {
  ensureWritable(readOnly);

  const data = await request<{ droplet: any }>('/droplets', {
    method: 'POST',
    body: JSON.stringify({
      name: input.name,
      region: input.region,
      size: input.size,
      image: input.image,
      ssh_keys: input.sshKeys,
      backups: input.backups,
      ipv6: input.ipv6,
      monitoring: input.monitoring,
      tags: input.tags,
    }),
  });

  return mapDroplet(data.droplet);
}

async function deleteDroplet(
  request: RequestFn,
  readOnly: boolean,
  dropletId: number,
): Promise<void> {
  ensureWritable(readOnly);
  await request<void>(`/droplets/${dropletId}`, { method: 'DELETE' });
}

async function listDomains(request: RequestFn): Promise<Domain[]> {
  const data = await request<{ domains: any[] }>('/domains');
  return data.domains.map((d) => ({
    name: d.name,
    ttl: d.ttl,
    zoneFile: d.zone_file,
  }));
}

async function createDomain(
  request: RequestFn,
  readOnly: boolean,
  name: string,
  ipAddress: string,
): Promise<Domain> {
  ensureWritable(readOnly);

  const data = await request<{ domain: any }>('/domains', {
    method: 'POST',
    body: JSON.stringify({ name, ip_address: ipAddress }),
  });

  return {
    name: data.domain.name,
    ttl: data.domain.ttl,
    zoneFile: data.domain.zone_file,
  };
}

async function deleteDomain(
  request: RequestFn,
  readOnly: boolean,
  name: string,
): Promise<void> {
  ensureWritable(readOnly);
  await request<void>(`/domains/${name}`, { method: 'DELETE' });
}

function mapDroplet(d: any): Droplet {
  return {
    id: d.id,
    name: d.name,
    memory: d.memory,
    vcpus: d.vcpus,
    disk: d.disk,
    status: d.status,
    createdAt: d.created_at,
    region: {
      slug: d.region?.slug ?? '',
      name: d.region?.name ?? '',
    },
    image: {
      id: d.image?.id ?? 0,
      name: d.image?.name ?? '',
      distribution: d.image?.distribution ?? '',
      slug: d.image?.slug ?? null,
    },
  };
}
