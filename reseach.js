import { promises as fs } from 'fs';
import fetch from 'node-fetch';
import cheerio from 'cheerio';
import Job_Exists from './check_duplicate.js';
import getJobDetails from './job_details.js';

function transformUrl(url) {
  return url.replace('https://lb.linkedin.com', 'https://www.linkedin.com');
}

// Function to fetch with retry logic
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to fetch with retry logic and delay
async function fetchWithRetry(url, options, retries = 600, delayMs = 1000) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.text(); // Get response as text
  } catch (error) {
    if (retries > 0) {
      console.error('Fetch error:', error.message, `Retrying in ${delayMs / 1000} seconds...`);
      await delay(delayMs);
      return await fetchWithRetry(url, options, retries - 1, delayMs);
    } else {
      throw new Error('Max retries reached. Failed to fetch.');
    }
  }
}

// Main function to save job list
export default async function saveJobList(n) {
  const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=&location=Beirut&geoId=105606446&trk=public_jobs_jobs-search-bar_search-submit&position=1&pageNum=0&start=${n}`;
  const options = {
    headers: {
      accept: '*/*',
      'accept-language': 'en-GB,en;q=0.9',
      'csrf-token': 'ajax:2711472108347807678',
      priority: 'u=1, i',
      'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      cookie:
        'JSESSIONID=ajax:2711472108347807678; lang=v=2&lang=en-us; bcookie="v=2&90c31730-05c4-43c0-8a8b-d25a47589eff"; bscookie="v=1&202407050948080ccc55ea-5724-4e15-8f2d-136177637fb6AQHUVAXVZIRPYSNBtTI_whqUqKHIKUJl"; _gcl_au=1.1.1317281315.1720172892; lidc="b=VGST03:s=V:r=V:a=V:p=V:g=3247:u=1:x=1:i=1720172892:t=1720259292:v=2:sig=AQHhtRZS4R2cbyR_feDHTbaRZKQwknJv"; AMCVS_14215E3D5995C57C0A495C55%40AdobeOrg=1; AMCV_14215E3D5995C57C0A495C55%40AdobeOrg=-637568504%7CMCIDTS%7C19910%7CMCMID%7C54109288882820670884546633751466216722%7CMCAAMLH-1720777693%7C6%7CMCAAMB-1720777693%7C6G1ynYcLPuiQxYZrsz_pkqfLG9yMXBpb2zX5dvJdYQJzPXImdj0y%7CMCOPTOUT-1720180093s%7CNONE%7CvVersion%7C5.1.1; aam_uuid=54652106246005236114600370336310034137; _uetsid=b183c0303ab311efb46ea328c240870d; _uetvid=b183e4a03ab311efa706eb39b29a5861',
      Referer: 'https://www.linkedin.com/jobs/search?keywords=&location=Beirut&geoId=105606446&trk=public_jobs_jobs-search-bar_search-submit&position=1&pageNum=0',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
    method: 'GET',
  };

  try {
    // Delay to avoid being blocked
    // await delay(10000);

    // Fetch HTML content
    const html = await fetchWithRetry(url, options);

    // Load HTML content with cheerio
    const $ = cheerio.load(html);

    // Initialize an empty array for existing jobs
    let existingJobList = [];
    try {
      // Read existing job list from file
      const existingData = await fs.readFile('jobList.json', 'utf8');

      // Check if the file is empty
      if (existingData.trim() === '') {
        console.log('jobList.json is empty. No jobs to check.');
        existingJobList = [];
      } else {
        // Parse JSON data and ensure it's an array
        try {
          existingJobList = JSON.parse(existingData);
          if (!Array.isArray(existingJobList)) {
            throw new Error('Parsed data is not an array');
          }
        } catch (jsonError) {
          console.error('Error parsing jobList.json:', jsonError.message);
          existingJobList = [];
        }
      }
    } catch (error) {
      // Handle file not found or JSON parsing errors
      if (error.code === 'ENOENT') {
        console.log('jobList.json file does not exist. Creating new list.');
        existingJobList = [];
      } else {
        console.error('Error reading jobList.json:', error.message);
        existingJobList = [];
      }
    }

    // Collect promises for job processing
    const jobPromises = [];
    $('li').each(async (index, element) => {
      jobPromises.push(async () => {
        // Extract job date
        const job_paste_date = $(element).find('.job-search-card__listdate').attr('datetime');

        // Extract job link
        let href = $(element).find('a.base-card__full-link').attr('href');
        if (href) {
          href = transformUrl(href);
          const urlObj = new URL(href);
          let urn = $(element).find('.base-card').attr('data-entity-urn');
          

          urn = await urn.slice(18,-1)
          console.log(urn);


          if (!await Job_Exists(urn)) {

            const job_details= await getJobDetails(urlObj)

            
            existingJobList.push({
              jobId: urn,
              link: href,
              date: job_paste_date,
              details: job_details
            });
          }
        }
      });
    });

    // Execute all job processing promises
    await Promise.all(jobPromises.map(p => p()));


    // Write the updated job list to the file
    await fs.writeFile('jobList.json', JSON.stringify(existingJobList, null, 2));
    console.log('JSON file has been updated.', n);

    // Save HTML content if needed
    if ($.html()) {
      await fs.writeFile('ul-content2.html', $.html());
    } else {
      console.error('Selector did not match any elements.');
    }
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}

// Call the function
// saveJobList(10);
