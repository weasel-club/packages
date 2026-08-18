export type PackageAuthor = {
  name?: string;
  url?: string;
  email?: string;
};

export type PackageVersion = {
  name: string;
  displayName?: string;
  version: string;
  description?: string;
  author?: PackageAuthor;
  dependencies?: Record<string, string>;
  vpmDependencies?: Record<string, string>;
  keywords?: string[];
  license?: string;
  licensesUrl?: string;
  url?: string;
};

export type Listing = {
  name: string;
  id: string;
  url: string;
  author?: string | PackageAuthor;
  packages: Record<string, { versions: Record<string, PackageVersion> }>;
};

export type LatestPackage = PackageVersion & {
  id: string;
  zipUrl: string;
  repoUrl: string;
  vpmDependencies: Record<string, string>;
};

export function listingUrl(): string {
  return `${import.meta.env.BASE_URL}index.json`;
}

export async function loadListing(): Promise<Listing> {
  const response = await fetch(listingUrl());
  if (!response.ok) {
    throw new Error(`Failed to load listing (${response.status})`);
  }
  return response.json() as Promise<Listing>;
}

export function latestPackages(listing: Listing): LatestPackage[] {
  return Object.entries(listing.packages).map(([id, entry]) => {
    const versions = Object.values(entry.versions);
    const latest = versions.sort((a, b) =>
      compareVersions(b.version, a.version),
    )[0];
    return {
      ...latest,
      id,
      name: latest?.name ?? id,
      zipUrl: latest?.url ?? "",
      repoUrl: githubRepoUrl(latest?.url ?? ""),
      vpmDependencies: latest?.vpmDependencies ?? latest?.dependencies ?? {},
    };
  });
}

function compareVersions(a: string, b: string): number {
  const [aCore, aPre = ""] = a.split("-");
  const [bCore, bPre = ""] = b.split("-");
  const as = aCore.split(".").map((n) => Number(n) || 0);
  const bs = bCore.split(".").map((n) => Number(n) || 0);
  for (let i = 0; i < Math.max(as.length, bs.length); i++) {
    const diff = (as[i] ?? 0) - (bs[i] ?? 0);
    if (diff) return diff;
  }
  if (aPre === bPre) return 0;
  if (!aPre) return 1;
  if (!bPre) return -1;
  return aPre.localeCompare(bPre);
}

export function authorName(author: Listing["author"]): string {
  if (!author) return "";
  return typeof author === "string" ? author : (author.name ?? "");
}

export function authorUrl(author: Listing["author"]): string {
  if (!author || typeof author === "string") return "";
  return author.url ?? "";
}

export function addRepoUrl(url: string): string {
  return `vcc://vpm/addRepo?url=${encodeURIComponent(url)}`;
}

export function githubRepoUrl(zipUrl: string): string {
  const match = zipUrl.match(/^(https:\/\/github\.com\/[^/]+\/[^/]+)/);
  return match?.[1] ?? "";
}

export function packageTitle(pkg: LatestPackage): string {
  return (pkg.displayName || pkg.name).trim();
}

export function packageSummary(pkg: LatestPackage): string | null {
  const title = packageTitle(pkg).toLowerCase();
  const description = (pkg.description ?? "").trim();
  if (!description || description.toLowerCase() === title) return null;
  return description;
}
