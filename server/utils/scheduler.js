import cron from 'node-cron';
import { runAllScrapers } from '../scrapers/index.js';

const DEFAULT_QUERIES = [
  { query: 'software engineer', location: 'Bangalore' },
  { query: 'full stack developer', location: 'Hyderabad' },
  { query: 'frontend developer', location: 'Mumbai' },
  { query: 'data scientist', location: 'Delhi' },
  { query: 'devops engineer', location: 'Pune' },
];

export function startScheduler() {
  const hours = process.env.SCRAPE_INTERVAL_HOURS || 6;
  const cronExpression = `0 */${hours} * * *`;

  cron.schedule(cronExpression, async () => {
    console.log(`⏰ [${new Date().toISOString()}] Running scheduled scrape...`);

    for (const { query, location } of DEFAULT_QUERIES) {
      try {
        const jobs = await runAllScrapers(query, location);
        console.log(`  ✅ Scraped ${jobs.length} jobs for "${query}" in ${location}`);
      } catch (error) {
        console.error(`  ❌ Scrape failed for "${query}" in ${location}:`, error.message);
      }
    }

    console.log(`✅ Scheduled scrape complete`);
  });

  console.log(`📅 Scrape scheduler: every ${hours} hours`);
}
