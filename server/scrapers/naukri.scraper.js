import puppeteer from 'puppeteer';
import axios from 'axios';

export async function scrapeNaukri(query, location) {
  const isVercel = process.env.VERCEL === 'true';
  const token = process.env.APIFY_TOKEN;

  if (isVercel && token && token !== 'your_apify_token_here') {
    console.log(`🤖 Naukri: Running via Apify (Vercel environment detected)`);
    try {
      const actorId = 'epicscrapers~naukri-scraper';
      const url = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${token}`;
      
      const slug = query.toLowerCase().replace(/ /g, '-');
      const locSlug = location.toLowerCase().replace(/ /g, '-');
      const targetUrl = `https://www.naukri.com/${slug}-jobs-in-${locSlug}`;
      
      const input = {
        startUrls: [
          { url: targetUrl }
        ],
        maxJobs: 15
      };

      const { data } = await axios.post(url, input, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000 // 1 minute
      });

      if (Array.isArray(data)) {
        const jobs = data.map((item) => {
          const loc = item.placeholders?.find(p => p.type === 'location')?.label || location;
          const sal = item.placeholders?.find(p => p.type === 'salary')?.label || '';
          const exp = item.experienceText || item.placeholders?.find(p => p.type === 'experience')?.label || '';
          
          return {
            title: item.title || '',
            company: item.companyName || '',
            location: loc,
            experience: exp,
            salary: sal,
            description: item.jobDescription?.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim() || '',
            sourceUrl: item.jobUrl || item.url || '',
            postedAt: item.footerPlaceholderLabel || 'Recently',
            source: 'naukri',
          };
        });
        
        console.log(`  ✅ Naukri (Apify): found ${jobs.length} jobs`);
        return jobs.filter((j) => j.title && j.sourceUrl);
      }
    } catch (err) {
      console.error(`  ❌ Naukri (Apify) error:`, err.message);
      // Fall through to Puppeteer
    }
  }

  // Local/Puppeteer scrape fallback
  console.log(`🔍 Naukri: Running via Puppeteer locally`);
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
      ],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    await page.setViewport({ width: 1366, height: 768 });

    const slug = query.replace(/ /g, '-');
    const url = `https://www.naukri.com/${slug}-jobs-in-${location.toLowerCase()}`;

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

    console.log(`  ✅ Naukri (Puppeteer): found ${jobs.length} jobs`);
    return jobs.filter((j) => j.title && j.sourceUrl);
  } catch (error) {
    console.error(`  ❌ Naukri (Puppeteer) error:`, error.message);
    return [];
  } finally {
    if (browser) await browser.close();
  }
}
