import saveJobList from './reseach.js'; // Use ./ for current directory
import { delay } from './reseach.js';
let batch_start = 0

async function get_all_jobs(){while(batch_start<1000){

    await saveJobList(batch_start)
    batch_start+=10;
    console.log("waiting second batch ...");
    await delay(5000)

}}

get_all_jobs()

