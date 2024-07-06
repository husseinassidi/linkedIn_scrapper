import { promises as fs } from 'fs';
import { type } from 'os';

// Function to check if a job with the given trackID exists
export default async function Job_Exists(jobId) {
  let existingJobList = [];

  try {
    // Read and parse the existing job list from the file
    const existingData = await fs.readFile('jobList.json', 'utf8');

    // Check if the file is empty
    if (existingData.trim() === '') {
      console.log('jobList.json is empty');
      return false
    }

    // Parse JSON data
    existingJobList = JSON.parse(existingData);

    // Check if any job in the list matches the given trackID
    // const jobExists = existingJobList.some(element => element.jobID === trackID);
    // console.log(jobExists);
    const jobExists = existingJobList.some(element => element.jobId === jobId);
    return jobExists;

    // console.log( existingJobList[0]);

    
    // return jobExists;
  } catch (error) {
    // Handle file not found or JSON parsing errors
    if (error.code === 'ENOENT') {
      console.log('jobList.json file does not exist. Returning false.');
      return false;
    } else if (error.name === 'SyntaxError') {
      console.error('Error parsing JSON from jobList.json:', error.message);
      return false;
    } else {
      console.error('Error reading or parsing jobList.json:', error);
      return false;
    }
  }
}

// Example usage
Job_Exists("391941686")
  .then(res => {
    console.log('Job Exists:', res);
  })
  .catch(err => {
    console.error('Error:', err);
  });
