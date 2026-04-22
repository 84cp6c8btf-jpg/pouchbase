import {
  applyCatalogPlan,
  buildCatalogPlan,
  createCatalogClient,
  fetchExistingCatalog,
  loadCatalogSource,
  normalizeCatalogDocument,
  printIssues,
  printPlan,
} from "./shared.mts";

function getArg(name: string) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

const source = getArg("--source");
const shouldWrite = process.argv.includes("--write");

if (!source) {
  console.error("Usage: node --env-file=.env.local scripts/catalog/import.mts --source <file-or-directory> [--write]");
  process.exit(1);
}

const client = createCatalogClient({ write: shouldWrite });
const document = await loadCatalogSource(source);
const normalized = normalizeCatalogDocument(document);

printIssues(normalized.issues);

if (normalized.issues.some((issue) => issue.level === "error")) {
  console.error("Import aborted because validation errors were found.");
  process.exit(1);
}

const existing = await fetchExistingCatalog(client);
const plan = buildCatalogPlan(normalized, existing);

printPlan(plan);

if (!shouldWrite) {
  console.log("Dry run complete. Re-run with --write to apply changes.");
  process.exit(0);
}

await applyCatalogPlan(client, plan);
console.log("Catalog import applied successfully.");

