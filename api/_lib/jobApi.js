import axios from 'axios'

// Cache to prevent hammering external APIs (5 minutes)
let jobsCache = null
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000 

async function fetchAdzunaJobs(search = '') {
  const appId = process.env.ADZUNA_APP_ID
  const appKey = process.env.ADZUNA_APP_KEY

  if (!appId || !appKey) {
    return []
  }

  try {
    const whatParam = search ? `&what=${encodeURIComponent(search)}` : ''
    // Search Nigeria (ng)
    const url = `https://api.adzuna.com/v1/api/jobs/ng/search/1?app_id=${appId}&app_key=${appKey}${whatParam}&results_per_page=10`
    
    const response = await axios.get(url)
    
    return response.data.results.map(job => ({
      id: `adz_${job.id}`,
      title: job.title.replace(/<\/?[^>]+(>|$)/g, ""),
      company_name: job.company?.display_name || 'Adzuna Partner',
      location: job.location?.display_name || 'Nigeria',
      job_type: 'full-time',
      pay_min: job.salary_min || null,
      pay_max: job.salary_max || null,
      pay_currency: 'NGN',
      pay_period: 'yearly',
      created_at: job.created,
      description: job.description.replace(/<\/?[^>]+(>|$)/g, ""),
      application_url: job.redirect_url,
      is_external: true,
      state_name: null,
      first_name: 'Adzuna',
      last_name: 'Jobs',
      poster_avatar: null
    }))
  } catch (error) {
    console.error('Adzuna API Error:', error.message)
    return []
  }
}

async function fetchJoobleJobs(search = '') {
  const apiKey = process.env.JOOBLE_API_KEY
  
  if (!apiKey) {
    return []
  }

  try {
    const url = `https://jooble.org/api/${apiKey}`
    const body = {
      location: "Nigeria",
      keywords: search,
      page: 1,
      resultonpage: 10
    }
    
    const response = await axios.post(url, body)
    
    return (response.data.jobs || []).map(job => ({
      id: `jobl_${job.id}`,
      title: job.title.replace(/<\/?[^>]+(>|$)/g, ""),
      company_name: job.company || 'Jooble Partner',
      location: job.location || 'Nigeria',
      job_type: 'full-time',
      pay_min: null, // Jooble salary parsing is often raw text (job.salary)
      pay_max: null,
      pay_currency: 'NGN',
      pay_period: 'yearly',
      created_at: job.updated, // Jooble gives updated time
      description: job.snippet.replace(/<\/?[^>]+(>|$)/g, ""),
      application_url: job.link,
      is_external: true,
      state_name: null,
      first_name: 'Jooble',
      last_name: 'Jobs',
      poster_avatar: null
    }))
  } catch (error) {
    console.error('Jooble API Error:', error.message)
    return []
  }
}

async function fetchRemotiveJobs(search = '') {
  try {
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : ''
    // Remotive provides remote jobs globally, often very useful in Nigeria
    const url = `https://remotive.com/api/remote-jobs?limit=10${searchParam}`
    
    const response = await axios.get(url)
    
    return (response.data.jobs || []).slice(0, 10).map(job => ({
      id: `rem_${job.id}`,
      title: job.title.replace(/<\/?[^>]+(>|$)/g, ""),
      company_name: job.company_name || 'Remotive Partner',
      location: job.candidate_required_location || 'Remote (Global)',
      job_type: 'remote',
      pay_min: null, 
      pay_max: null,
      pay_currency: 'USD', // Often USD on Remotive
      pay_period: 'yearly',
      created_at: job.publication_date,
      description: (job.description || '').replace(/<\/?[^>]+(>|$)/g, "").substring(0, 200) + '...',
      application_url: job.url,
      is_external: true,
      state_name: null,
      first_name: 'Remotive',
      last_name: 'Jobs',
      poster_avatar: null
    }))
  } catch (error) {
    console.error('Remotive API Error:', error.message)
    return []
  }
}

/**
 * Fetch jobs from multiple APIs and aggregate
 * @param {string} search Query string
 */
export async function fetchExternalJobs(search = '') {
  const now = Date.now()
  const cacheKey = `ext_${search.toLowerCase()}`
  
  if (jobsCache && jobsCache.key === cacheKey && (now - cacheTimestamp < CACHE_TTL)) {
    return jobsCache.data
  }

  // Fetch concurrently
  const results = await Promise.allSettled([
    fetchAdzunaJobs(search),
    fetchJoobleJobs(search),
    fetchRemotiveJobs(search)
  ])

  let allJobs = []
  
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allJobs = allJobs.concat(result.value)
    }
  }

  // Shuffle or sort if desired, for now we just sort by creation date descending
  allJobs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  jobsCache = { key: cacheKey, data: allJobs }
  cacheTimestamp = now

  return allJobs
}
