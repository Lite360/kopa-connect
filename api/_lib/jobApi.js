import axios from 'axios'

// Cache to prevent hammering the external API (5 minutes)
let jobsCache = null
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000 

/**
 * Fetch jobs from Adzuna API for Nigeria
 * @param {string} search Query string
 */
export async function fetchExternalJobs(search = '') {
  const appId = process.env.ADZUNA_APP_ID
  const appKey = process.env.ADZUNA_APP_KEY

  if (!appId || !appKey) {
    console.warn('Adzuna API credentials missing. Skipping external jobs.')
    return []
  }

  const now = Date.now()
  const cacheKey = `adzuna_${search.toLowerCase()}`
  
  if (jobsCache && jobsCache.key === cacheKey && (now - cacheTimestamp < CACHE_TTL)) {
    return jobsCache.data
  }

  try {
    const whatParam = search ? `&what=${encodeURIComponent(search)}` : ''
    // Search Nigeria (ng)
    const url = `https://api.adzuna.com/v1/api/jobs/ng/search/1?app_id=${appId}&app_key=${appKey}${whatParam}&results_per_page=20`
    
    const response = await axios.get(url)
    
    // Normalize to match local job structure
    const normalizedJobs = response.data.results.map(job => ({
      id: `ext_${job.id}`,
      title: job.title.replace(/<\/?[^>]+(>|$)/g, ""), // strip HTML
      company_name: job.company?.display_name || 'External Company',
      location: job.location?.display_name || 'Nigeria',
      job_type: 'full-time', // Adzuna doesn't easily map to our enum, default to full-time
      pay_min: job.salary_min || null,
      pay_max: job.salary_max || null,
      pay_currency: 'NGN',
      pay_period: 'yearly', // Adzuna salaries are usually annualized
      created_at: job.created,
      description: job.description.replace(/<\/?[^>]+(>|$)/g, ""),
      application_url: job.redirect_url, // URL to apply on Adzuna
      is_external: true, // Flag for frontend
      state_name: null,
      first_name: 'Adzuna',
      last_name: 'Partner',
      poster_avatar: null
    }))

    jobsCache = { key: cacheKey, data: normalizedJobs }
    cacheTimestamp = now

    return normalizedJobs
  } catch (error) {
    console.error('Failed to fetch external jobs:', error.message)
    return []
  }
}
