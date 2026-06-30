import { runAllScrapers, runScraper } from '../scrapers/index.js';

export const scrapeAll = async (req, res, next) => {
  try {
    const { query = 'software engineer', location = 'Bangalore' } = req.body;
    const jobs = await runAllScrapers(query, location);
    res.json({
      success: true,
      scraped: jobs.length,
      message: `Scraped ${jobs.length} jobs for "${query}" in ${location}`,
    });
  } catch (err) {
    next(err);
  }
};

export const scrapePlatform = async (req, res, next) => {
  try {
    const { platform } = req.params;
    const { query = 'software engineer', location = 'Bangalore' } = req.body;
    const jobs = await runScraper(platform, query, location);
    res.json({
      success: true,
      platform,
      scraped: jobs.length,
      message: `Scraped ${jobs.length} jobs from ${platform}`,
    });
  } catch (err) {
    next(err);
  }
};
