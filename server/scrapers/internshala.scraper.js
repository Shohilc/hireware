import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeInternshala(query, location) {
  const slug = query.toLowerCase().replace(/ /g, '-');
  const locSlug = location.toLowerCase().replace(/ /g, '-');
  const url = `https://internshala.com/jobs/${slug}-jobs-in-${locSlug}`;
  console.log(`🔍 Scraping Internshala: ${url}`);

  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(data);
    const jobs = [];

    $('.internship_meta, .individual_internship').each((_, el) => {
      const link = $(el).find('a.job-title-href, a.view_detail_button, h3 a');
      const href = link.attr('href');

      let salary = '';
      let experience = '';
      $(el).find('.detail-row-1 .row-1-item, .row-1-item').each((_, item) => {
        const text = $(item).text().trim().replace(/\s+/g, ' ');
        if (text.includes('₹') || text.includes('/year') || text.includes('/month') || text.includes('LPA')) {
          const mobileText = $(item).find('.mobile').text().trim().replace(/\s+/g, ' ');
          salary = mobileText || text;
        } else if (text.toLowerCase().includes('experience') || text.toLowerCase().includes('year') || text.toLowerCase().includes('fresher')) {
          experience = text;
        }
      });

      const rawCompany = $(el).find('.company-name, .company_name').text().replace(/\s+/g, ' ').trim();
      const company = rawCompany.split(' Actively')[0].trim();

      jobs.push({
        title: link.text().replace(/\s+/g, ' ').trim() || $(el).find('.profile').text().replace(/\s+/g, ' ').trim(),
        company,
        location: $(el).find('.locations span, .location_link').text().replace(/\s+/g, ' ').trim(),
        salary,
        experience,
        sourceUrl: href ? (href.startsWith('http') ? href : `https://internshala.com${href}`) : '',
        source: 'internshala',
        type: 'Full-time',
        postedAt: $(el).find('.status-success, .posted_by_container span').text().trim(),
      });
    });

    console.log(`  ✅ Internshala: found ${jobs.length} jobs`);
    return jobs.filter((j) => j.title && j.sourceUrl);
  } catch (error) {
    console.error(`  ❌ Internshala scraper error:`, error.message);
    return [];
  }
}
