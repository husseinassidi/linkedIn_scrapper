
import { promises as fs } from 'fs';
import fetch from 'node-fetch';

import cheerio from 'cheerio';
import { log } from 'console';

export default  function saveJobList(n){

  fetch(`https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=&location=Beirut&geoId=105606446&trk=public_jobs_jobs-search-bar_search-submit&position=1&pageNum=0&start=${n}`, {
    "headers": {
      "accept": "*/*",
      "accept-language": "en-GB,en;q=0.9",
      "csrf-token": "ajax:2711472108347807678",
      "priority": "u=1, i",
      "sec-ch-ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Google Chrome\";v=\"126\"",
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": "\"Android\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "cookie": "JSESSIONID=ajax:2711472108347807678; lang=v=2&lang=en-us; bcookie=\"v=2&90c31730-05c4-43c0-8a8b-d25a47589eff\"; bscookie=\"v=1&202407050948080ccc55ea-5724-4e15-8f2d-136177637fb6AQHUVAXVZIRPYSNBtTI_whqUqKHIKUJl\"; _gcl_au=1.1.1317281315.1720172892; lidc=\"b=VGST03:s=V:r=V:a=V:p=V:g=3247:u=1:x=1:i=1720172892:t=1720259292:v=2:sig=AQHhtRZS4R2cbyR_feDHTbaRZKQwknJv\"; AMCVS_14215E3D5995C57C0A495C55%40AdobeOrg=1; AMCV_14215E3D5995C57C0A495C55%40AdobeOrg=-637568504%7CMCIDTS%7C19910%7CMCMID%7C54109288882820670884546633751466216722%7CMCAAMLH-1720777693%7C6%7CMCAAMB-1720777693%7C6G1ynYcLPuiQxYZrsz_pkqfLG9yMXBpb2zX5dvJdYQJzPXImdj0y%7CMCOPTOUT-1720180093s%7CNONE%7CvVersion%7C5.1.1; aam_uuid=54652106246005236114600370336310034137; _uetsid=b183c0303ab311efb46ea328c240870d; _uetvid=b183e4a03ab311efa706eb39b29a5861",
      "Referer": "https://www.linkedin.com/jobs/search?keywords=&location=Beirut&geoId=105606446&trk=public_jobs_jobs-search-bar_search-submit&position=1&pageNum=0",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    "body": null,
    "method": "GET"
  }).then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.text(); // Get response as text
  })
  .then(html => {
    const $ = cheerio.load(html);
    const jobListHtml = [];
    const jobs_date = []

    //  get the div ID and the and JOB date 
// get job date

$(".job-search-card__listdate").each((index,element)=>{

  const job_paste_date = $(element).attr('datetime')

  jobs_date.push(job_paste_date)



})
console.log(jobs_date)


let i =0
    // Iterate over each <a> tag to extract href attributes
    $('a.base-card__full-link').each((index, element) => {
        const href = $(element).attr('href');
        // Check if href exists to avoid pushing undefined values
        if (href) {
          // ccn
          const urlObj = new URL(href);
          const refId = urlObj.searchParams.get('refId');
          const trackingId = urlObj.searchParams.get('trackingId');

  
          jobListHtml.push({refrID:refId,trackID:trackingId, item: index, link: href ,date:jobs_date[i]});
          i++;
            
        }
    });



    fs.writeFile('jobList.json', JSON.stringify(jobListHtml, null, 2), (err) => {
        if (err) {
            console.error('Error writing to file', err);
        } else {
            console.log('JSON file has been saved.');
        }
    });
    for (let i = 0; i < jobListHtml.length; i++) {
      jobListHtml[i].date = jobs_date[i];
  }
  

    console.log(jobListHtml);

  
    if ($.html()) {
      fs.writeFile('ul-content2.html', $.html(), (err) => {
        log("hurray")
        if (err) throw err;
        console.log('The file has been saved!');
      });
    } else {
      console.error('Selector did not match any elements.');
    }
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });

}

saveJobList(10)