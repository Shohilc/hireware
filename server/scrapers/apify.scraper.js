import axios from 'axios';

/**
 * Apify Scraper Integration.
 * Triggers an Apify Actor (e.g., LinkedIn Jobs Scraper) using Apify API Token.
 */
export async function scrapeApify(query, location) {
  const token = process.env.APIFY_TOKEN;
  const rawActorId = process.env.APIFY_ACTOR_ID || 'apify~linkedin-jobs-scraper';
  const actorId = rawActorId.replace('/', '~');

  if (!token || token === 'your_apify_token_here') {
    console.warn('⚠️ Apify Scraper is enabled but APIFY_TOKEN is not configured in server/.env.');
    console.warn('   Please set APIFY_TOKEN to trigger real Apify actor runs.');
    return [];
  }

  console.log(`🔍 Scraping via Apify actor "${actorId}": query="${query}", location="${location}"`);

  try {
    // Call Apify's run-sync-get-dataset-items endpoint for instant synchronous results
    const url = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${token}`;
    
    const input = {
      queries: `${query}\n${location}`,
      limit: 10,
      location: location,
    };

    const { data } = await axios.post(url, input, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 60000, // Sync execution can take up to 60 seconds
    });

    if (!Array.isArray(data)) {
      console.warn('⚠️ Apify did not return an array of dataset items:', data);
      return [];
    }

    const jobs = data.map((item) => {
      // Normalize common Apify LinkedIn scraper fields
      const rawUrl = item.jobUrl || item.url || '';
      const sourceUrl = rawUrl ? rawUrl.split('?')[0] : '';
      
      return {
        title: item.title || item.positionName || '',
        company: item.companyName || item.company || '',
        location: item.location || location,
        sourceUrl,
        source: 'linkedin', // mark as LinkedIn since it scrapes LinkedIn
        type: item.jobType || 'Full-time',
        postedAt: item.postedAt || item.postDate || 'Recently',
        salary: item.salary || '',
        description: item.description || item.jobDescription || '',
      };
    });

    console.log(`  ✅ Apify Scraper: found ${jobs.length} jobs`);
    return jobs.filter((j) => j.title && j.sourceUrl);
  } catch (error) {
    console.error(`  ❌ Apify Scraper error:`, error.message);
    return [];
  }
}
