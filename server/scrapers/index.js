import { scrapeLinkedIn } from './linkedin.scraper.js';
import { scrapeNaukri } from './naukri.scraper.js';
import { scrapeIndeed } from './indeed.scraper.js';
import { scrapeInternshala } from './internshala.scraper.js';
import { scrapeGlassdoor } from './glassdoor.scraper.js';
import { scrapeApify } from './apify.scraper.js';
import { deduplicateJobs } from '../utils/deduplicate.js';
import { normalizeJob } from '../utils/normalizeJob.js';
import Job from '../models/Job.js';
import redis from '../config/redis.js';

/**
 * Run all scrapers, deduplicate, normalize, cache, and upsert to DB.
 */
export async function runAllScrapers(query = 'software engineer', location = 'Bangalore') {
  const cacheKey = `scrape:${query}:${location}`;

  // Check Redis cache first (6hr TTL)
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached;
      console.log(`📦 Cache hit for "${query}" in ${location}: ${parsed.length} jobs`);
      return parsed;
    }
  } catch (err) {
    console.warn('Cache read error:', err.message);
  }

  console.log(`🕷️ Starting scrape: "${query}" in ${location}`);

  const results = await Promise.allSettled([
    scrapeNaukri(query, location),
    scrapeIndeed(query, location),
    scrapeInternshala(query, location),
    scrapeLinkedIn(query, location),
    scrapeApify(query, location),
    // Glassdoor is stubbed — uncomment when API is available
    // scrapeGlassdoor(query, location),
  ]);

  // Collect successful results
  const allJobs = results
    .filter((r) => r.status === 'fulfilled')
    .flatMap((r) => r.value);

  // Log failures
  results
    .filter((r) => r.status === 'rejected')
    .forEach((r) => console.error('Scraper failed:', r.reason?.message));

  // Normalize and deduplicate
  const normalized = allJobs.map(normalizeJob);
  const unique = deduplicateJobs(normalized);

  console.log(`📊 Total: ${allJobs.length} raw → ${unique.length} unique jobs`);

  // Upsert to MongoDB
  let upserted = 0;
  for (const job of unique) {
    try {
      await Job.findOneAndUpdate(
        { sourceUrl: job.sourceUrl },
        job,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      upserted++;
    } catch (err) {
      // Skip duplicate key errors silently
      if (err.code !== 11000) {
        console.error(`DB upsert error for "${job.title}":`, err.message);
      }
    }
  }

  console.log(`💾 Upserted ${upserted} jobs to MongoDB`);

  // Cache results (6 hours)
  try {
    await redis.set(cacheKey, JSON.stringify(unique), { ex: 21600 });
  } catch (err) {
    console.warn('Cache write error:', err.message);
  }

  return unique;
}

/**
 * Run a single scraper by platform name.
 */
export async function runScraper(platform, query, location) {
  const scrapers = {
    naukri: scrapeNaukri,
    indeed: scrapeIndeed,
    internshala: scrapeInternshala,
    linkedin: scrapeLinkedIn,
    apify: scrapeApify,
    glassdoor: scrapeGlassdoor,
  };

  const scraper = scrapers[platform];
  if (!scraper) throw new Error(`Unknown platform: ${platform}`);

  const jobs = await scraper(query, location);
  return jobs.map(normalizeJob);
}
