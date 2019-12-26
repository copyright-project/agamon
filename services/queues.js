const Queue = require('bull');
const db = require('./db');

const QUEUES = {
  USERS: {
    WITH_MANY_IMAGES: 'usersWithManyImages',
    WITH_FEW_IMAGES: 'usersWithFewImages'
  },
  IMAGES: 'images'
};

const SAMPLE_TIMER = 1000 * 5;

const usersWithManyImages = new Queue('usersWithManyImages', {
  limiter: {
    max: 20,
    duration: 1000 * 60 * 60
  }
});

const usersWithFewImages = new Queue('usersWithFewImages', {
  limiter: {
    max: 100,
    duration: 1000 * 60 * 60
  }
});

const imagesQueue = new Queue('images');

usersWithManyImages.process(`${process.cwd()}/processors/user.js`);
usersWithFewImages.process(`${process.cwd()}/processors/user.js`);
imagesQueue.process(`${process.cwd()}/processors/image.js`);

const nameToQueueMap = {
  [QUEUES.IMAGES]: imagesQueue,
  [QUEUES.USERS.WITH_FEW_IMAGES]: usersWithFewImages,
  [QUEUES.USERS.WITH_MANY_IMAGES]: usersWithManyImages
};

imagesQueue.on('drained', async () => {
  console.log('all images are processed');
  const registeredImagesMap = await db.local.getRegisteredImagesForAllUsers();
  await Promise.all(Object.entries(registeredImagesMap).map(([key, value]) => db.new.updateField(key, 'registeredImagesCount', value)));
});


const addToQueue = (queueName, payload) => {
  const q = nameToQueueMap[queueName];
  return q.add(payload);
};

const printProgress = async () => {
  const waitingJobsCounts = await Promise.all([
    usersWithFewImages.getWaitingCount(),
    usersWithManyImages.getWaitingCount(),
    imagesQueue.getWaitingCount()
  ]);
  console.log(`${waitingJobsCounts[0] + waitingJobsCounts[1]} users | ${waitingJobsCounts[2]} images are left`);
};

setInterval(printProgress, SAMPLE_TIMER);

module.exports = {
  addToQueue,
  QUEUES
};