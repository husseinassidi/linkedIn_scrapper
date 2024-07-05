import { promises as fs } from 'fs';
import fetch from 'node-fetch';
import cheerio from 'cheerio';

/* classes needed:
job title
class="top-card-layout__title font-sans text-lg papabear:text-xl font-bold leading-open text-color-text mb-0 topcard__title"

company name
class="topcard__org-name-link topcard__flavor--black-link" 

location 
topcard__flavor topcard__flavor--bullet

general date: 
class="posted-time-ago__text topcard__flavor--metadata"

num of applicants: 
num-applicants__caption

Job Title x
Company Name x
Job Location x
Job Description
Job Post Date x
Skills Needed 
Application Link




*/ 



fetch("https://www.linkedin.com/jobs/view/customer-service-representative-english-speaker-at-es-3947251755?position=6&pageNum=0&refId=0sfeSTKaidOjDHYEe16TFg%3D%3D&trackingId=XLW73rrskNl%2FHaE3DG6CFw%3D%3D&trk=public_jobs_jserp-result_search-card")
  .then(res => res.text())
  .then(content => {
    if (content) {
      const $ = cheerio.load(content);
      const selectedContent = $(".top-card-layout__card.relative.p-2.papabear\\:p-details-container-padding").html();
      
      if (selectedContent) {
        fs.writeFile('ul-content23.html', selectedContent)
          .then(() => {
            console.log('Content saved to ul-content23.html');
          })
          .catch(err => {
            console.error('Error writing to file:', err);
          });
      } else {
        console.error('Selector did not match any elements.');
      }
    }
  })
  .catch(err => {
    console.error('Error fetching the URL:', err);
  });
