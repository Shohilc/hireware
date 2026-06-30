/**
 * Deduplicate jobs by sourceUrl or composite key (title + company).
 * Prefers the first occurrence.
 */
export function deduplicateJobs(jobs) {
  const seen = new Set();

  return jobs.filter((job) => {
    // Primary key: source URL
    const primaryKey = job.sourceUrl;
    if (primaryKey && seen.has(primaryKey)) return false;
    if (primaryKey) seen.add(primaryKey);

    // Secondary key: title + company (catch cross-platform dupes)
    const secondaryKey = `${(job.title || '').toLowerCase().trim()}::${(job.company || '').toLowerCase().trim()}`;
    if (seen.has(secondaryKey)) return false;
    seen.add(secondaryKey);

    return true;
  });
}
