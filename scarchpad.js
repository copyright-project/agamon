const Queue = require('bull');

const masterQueue = new Queue('master-queue', {
  limiter: {
    max: 20,
    duration: 1000 * 60
  }
});

const slaveQueue = new Queue('slave-queue', {
  limiter: {
    max: 5,
    duration: 1000
  }
});

masterQueue.process(function (job, done) {
  // console.log('master work ', job.data);
  for (let x = 0; x < 20; x++) {
    slaveQueue.add(x);
  }
  done();
});

slaveQueue.process(function (job, done) {
  // console.log('slave work ', job.data);
  done();
});

setTimeout(() => {
  for (let i = 0; i < 60; i++) {
    masterQueue.add(i);
  }
}, 1200);

const printProgress = async () => {
  const res1 = await masterQueue.getJobCounts();
  const res2 = await slaveQueue.getJobCounts();
  console.log(`
    ${JSON.stringify(res1)} master jobs 
    ${JSON.stringify(res2)} slave jobs 
  `);
}

const interval = setInterval(printProgress, 1000);