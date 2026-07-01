import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * LinkedIn Scraper using Cheerio to scrape the public LinkedIn guest Job Search URL.
 * Aggregates job details without requiring cookies or authentication.
 */
export async function scrapeLinkedIn(query, location) {
  const q = encodeURIComponent(query);
  const loc = encodeURIComponent(location);
  const url = `https://www.linkedin.com/jobs/search?keywords=${q}&location=${loc}&f_TPR=r604800&position=1&pageNum=0`;
  
  console.log(`🔍 Scraping LinkedIn: ${url}`);

  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(data);
    const jobs = [];

    $('.jobs-search__results-list li, .base-card, .base-search-card').each((_, el) => {
      const titleEl = $(el).find('.base-search-card__title, .job-search-card__title');
      const companyEl = $(el).find('.base-search-card__subtitle a, .base-search-card__subtitle, .job-search-card__subtitle');
      const locationEl = $(el).find('.job-search-card__location');
      const linkEl = $(el).find('.base-card__full-link, a[data-tracking-control-name="public_jobs_jserp-result_search-card"]');
      const timeEl = $(el).find('.job-search-card__listdate, .job-search-card__listdate--new');

      const title = titleEl.text().trim();
      const company = companyEl.text().trim();
      const jobLocation = locationEl.text().trim();
      const rawUrl = linkEl.attr('href') || '';
      const sourceUrl = rawUrl ? rawUrl.split('?')[0] : '';
      const postedAt = timeEl.text().trim() || 'Recently';

      if (title && sourceUrl) {
        jobs.push({
          title,
          company,
          location: jobLocation || 'India',
          sourceUrl,
          source: 'linkedin',
          type: 'Full-time',
          postedAt,
        });
      }
    });

    console.log(`  ✅ LinkedIn: found ${jobs.length} jobs`);
    return jobs;
  } catch (error) {
    console.error(`  ❌ LinkedIn scraper error:`, error.message);
    return [];
  }
}
