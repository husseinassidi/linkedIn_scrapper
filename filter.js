import { promises as fs } from 'fs';

// Keywords for matching
const categoryKeyWords = [
  "Mlops",
  "Machine Learning",
  "DevOps",
  "Model Deployment",
  "Continuous Integration (CI)",
  "Continuous Deployment (CD)",
  "Version Control",
  "Model Monitoring",
  "Data Pipeline",
  "Feature Engineering",
  "Model Training",
  "Automated Testing",
  "Model Registry",
  "Scalability",
  "Reproducibility",
  "Data Drift",
  "Model Drift",
  "Hyperparameter Tuning",
  "Orchestration",
  "Data Ingestion",
  "Model Serving",
  "Kubernetes",
  "Docker",
  "API Management",
  "Infrastructure as Code (IaC)",
  "Observability",
  "Logging",
  "Alerting",
  "Experiment Tracking",
  "A/B Testing",
  "Security Compliance",
  "canonical"
];

// Function to filter jobs based on category keywords
export default async function filter_jobs(category) {
  let matches_category = [];

  try {
    const existingData = await fs.readFile('jobList.json', 'utf8');

    if (existingData.trim() === '') {
      console.log('jobList.json is empty');
      return matches_category;
    }

    const existingJobList = JSON.parse(existingData);

    existingJobList.forEach(job => {
      let percentage = 0; // Reset percentage for each job

      // Use optional chaining to safely access properties
      const jobTitle = job.details?.Job_Title?.toLowerCase() || '';
      const jobDescription = job.details?.Job_Description?.toLowerCase() || '';
      const jobIndustry = job.details?.Industry?.toLowerCase() || '';
      const company = job.details?.Company_Name?.toLowerCase() || '';

      categoryKeyWords.forEach(keyword => {
        const lowerKeyword = keyword.toLowerCase();

        if (jobTitle.includes(lowerKeyword)) {
          percentage += 40;
        }

        if (jobDescription.includes(lowerKeyword)) {
          percentage += 30;
        }

        if (jobIndustry.includes(lowerKeyword)) {
          percentage += 30;
        }

        if (company.includes(lowerKeyword)) {
          percentage += 30;
        }
      });

      if (percentage > 0) {
        matches_category.push({
          match_id: job.jobId,
          perc: percentage
        });
      }
    });

  } catch (error) {
    console.error('Error reading or parsing jobList.json:', error);
  }

  return matches_category;
}

// Example usage
filter_jobs("Mlops")
  .then(matches => {
    console.log('Matches:', matches);
  })
  .catch(err => {
    console.error('Error:', err);
  });
