import puppeteer from 'puppeteer';

export async function scrapeNaukri(query, location) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--single-process',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    await page.setViewport({ width: 1366, height: 768 });

    const slug = query.replace(/ /g, '-');
    const url = `https://www.naukri.com/${slug}-jobs-in-${location.toLowerCase()}`;
    console.log(`🔍 Scraping Naukri: ${url}`);

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for job listings to load
    await page.waitForSelector('.srp-jobtuple-wrapper, .jobTuple', { timeout: 10000 }).catch(() => {});

    const jobs = await page.evaluate(() => {
      const cards = document.querySelectorAll('.srp-jobtuple-wrapper, .jobTuple');
      return Array.from(cards)
        .slice(0, 30)
        .map((el) => ({
          title: el.querySelector('.title, .desig')?.innerText?.trim() || '',
          company: el.querySelector('.comp-name, .companyInfo a')?.innerText?.trim() || '',
          location: el.querySelector('.locWdth, .loc')?.innerText?.trim() || '',
          experience: el.querySelector('.expwdth, .exp')?.innerText?.trim() || '',
          salary: el.querySelector('.sal, .salary')?.innerText?.trim() || '',
          description: el.querySelector('.job-desc, .ellipsis')?.innerText?.trim() || '',
          sourceUrl: el.querySelector('a.title, a.desig')?.href || '',
          postedAt: el.querySelector('.job-post-day, .freshness')?.innerText?.trim() || '',
          source: 'naukri',
        }));
    });

    console.log(`  ✅ Naukri: found ${jobs.length} jobs`);
    return jobs.filter((j) => j.title && j.sourceUrl);
  } catch (error) {
    console.error(`  ❌ Naukri scraper error:`, error.message);
    return [];
  } finally {
    await browser.close();
  }
}
