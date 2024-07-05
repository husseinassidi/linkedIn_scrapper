import { promises as fs } from 'fs';
import fetch from 'node-fetch';
import { log } from 'console';


async function processFile() {
    try {

 
        const data = await fs.readFile('jobList.json', 'utf8');
        const jobList = JSON.parse(data);

   
        for (const element of jobList) {
            const url = element.link;

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const myHtml = await response.text();
                log(myHtml);
            } catch (fetchErr) {
                console.error('Error fetching URL', fetchErr);
            }
        }
    } catch (err) {
        console.error('Error reading or parsing file', err);
    }
}

processFile();
