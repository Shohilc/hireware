import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeIndeed(query, location) {
  const url = `https://in.indeed.com/jobs?q=${encodeURIComponent(query)}&l=${encodeURIComponent(location)}&sort=date`;
  console.log(`🔍 Scraping Indeed: ${url}`);

  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(data);
    const jobs = [];

    $('div.job_seen_beacon, div.resultContent').each((_, el) => {
      const titleEl = $(el).find('h2.jobTitle span[title], h2.jobTitle a');
      const href = $(el).find('h2.jobTitle a').attr('href');

      jobs.push({
        title: titleEl.attr('title') || titleEl.text().trim(),
        company: $(el).find('[data-testid="company-name"], .companyName').text().trim(),
        location: $(el).find('[data-testid="text-location"], .companyLocation').text().trim(),
        salary: $(el).find('[data-testid="attribute_snippet_testid"], .salary-snippet-container').first().text().trim(),
        description: $(el).find('.job-snippet, .underShelfFooter').text().trim(),
        sourceUrl: href ? (href.startsWith('http') ? href : `https://in.indeed.com${href}`) : '',
        postedAt: $(el).find('[data-testid="myJobsStateDate"], .date').text().trim(),
        source: 'indeed',
      });
    });

    console.log(`  ✅ Indeed: found ${jobs.length} jobs`);
    return jobs.filter((j) => j.title && j.sourceUrl);
  } catch (error) {
    console.error(`  ❌ Indeed scraper error:`, error.message);
    return [];
  }
}
