import { useEffect, useMemo, useState } from "react";
import { CheckIcon, CopyIcon, DownloadIcon, SearchIcon } from "lucide-react";
import source from "../../source.json";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  addRepoUrl,
  latestPackages,
  loadListing,
  packageSummary,
  packageTitle,
  type LatestPackage,
} from "./listing";

export function App() {
  const [packages, setPackages] = useState<LatestPackage[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const repoUrl = source.url;

  useEffect(() => {
    loadListing()
      .then((listing) => setPackages(latestPackages(listing)))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load listing"),
      );
  }, []);

  const visible = useMemo(() => {
    if (!packages) return [];
    const needle = query.trim().toLowerCase();
    if (!needle) return packages;
    return packages.filter((pkg) => {
      const title = packageTitle(pkg).toLowerCase();
      const summary = (packageSummary(pkg) ?? "").toLowerCase();
      return (
        title.includes(needle) ||
        pkg.id.toLowerCase().includes(needle) ||
        summary.includes(needle)
      );
    });
  }, [packages, query]);

  async function copyUrl() {
    await navigator.clipboard.writeText(repoUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-xl flex-col gap-6 px-4 py-8">
      <header className="flex justify-center">
        <div className="grid size-56 place-items-center rounded-full bg-foreground dark:bg-transparent">
          <img
            className="h-auto w-48"
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="Weasel Club"
          />
        </div>
      </header>

      <section className="flex flex-col gap-3">
        <Button asChild size="lg" className="w-full">
          <a href={addRepoUrl(repoUrl)}>Add to VCC / ALCOM</a>
        </Button>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input readOnly value={repoUrl} aria-label="Listing URL" />
          <Button type="button" variant="outline" onClick={copyUrl}>
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search packages…"
            type="search"
          />
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Could not load packages</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {!error && packages === null ? (
          <div className="divide-y divide-border/70">
            <Skeleton className="h-16 rounded-none" />
            <Skeleton className="h-16 rounded-none" />
            <Skeleton className="h-16 rounded-none" />
          </div>
        ) : null}

        {!error && packages && visible.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No packages match “{query}”.
          </p>
        ) : null}

        <ul className="divide-y divide-border/70">
          {visible.map((pkg) => {
            const title = packageTitle(pkg);
            const summary = packageSummary(pkg);
            return (
              <li
                key={pkg.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0">
                  <h2 className="font-heading text-base font-medium">
                    {pkg.repoUrl ? (
                      <a
                        className="hover:underline hover:underline-offset-4"
                        href={pkg.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {title}
                      </a>
                    ) : (
                      title
                    )}
                  </h2>
                  {summary ? (
                    <p className="mt-0.5 text-sm text-muted-foreground">{summary}</p>
                  ) : null}
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    {pkg.id} · v{pkg.version}
                  </p>
                </div>
                {pkg.zipUrl ? (
                  <Button asChild size="sm" variant="ghost" className="shrink-0 self-start">
                    <a href={pkg.zipUrl} target="_blank" rel="noreferrer">
                      <DownloadIcon />
                      ZIP
                    </a>
                  </Button>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
