const db = require('./db');
const Queue = require('bull');
const logger = require('./logger');

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
    duration: 1000 * 60 * 60,
    bounceBack: true
  }
});

const usersWithFewImages = new Queue('usersWithFewImages', {
  limiter: {
    max: 100,
    duration: 1000 * 60 * 60,
    bounceBack: true
  }
});

const imagesQueue = new Queue('images', {
  limiter: {
    max: 7,
    duration: 1000
  }
});

usersWithManyImages.process(`${process.cwd()}/processors/user.js`);
usersWithFewImages.process(`${process.cwd()}/processors/user.js`);
imagesQueue.process(`${process.cwd()}/processors/image.js`);

const nameToQueueMap = {
  [QUEUES.IMAGES]: imagesQueue,
  [QUEUES.USERS.WITH_FEW_IMAGES]: usersWithFewImages,
  [QUEUES.USERS.WITH_MANY_IMAGES]: usersWithManyImages
};

const addToQueue = (queueName, payload) => {
  const q = nameToQueueMap[queueName];
  return q.add(payload);
};

const updateRegisteredImages = async () => {
  logger.info('all images are processed');
  const registeredImagesMap = await db.local.getRegisteredImagesForAllUsers();
  await Promise.all(
    Object
      .entries(registeredImagesMap)
      .map(([key, value]) => db.new.updateFields(key, { registeredImagesCount: value, isSyncedBack: true }))
  );
};

const isMigrationDone = ({ users, images }) =>
  images.completed > 0 &&
  images.waiting === 0 &&
  images.active === 0 &&
  images.failed === 0 &&
  images.delayed === 0;

const printProgress = ({ users, images }) =>
  logger.info(`users: ${JSON.stringify(users)} | images: ${JSON.stringify(images)}`);

const getProgress = async () => {
  const [
    fewImagesUsersCounts,
    manyImagesUsersCounts,
    imagesCounts
  ] = await Promise.all([
    usersWithFewImages.getJobCounts(),
    usersWithManyImages.getJobCounts(),
    imagesQueue.getJobCounts()
  ]);

  const users = {
    waiting: fewImagesUsersCounts.waiting + manyImagesUsersCounts.waiting,
    active: fewImagesUsersCounts.active + manyImagesUsersCounts.active,
    completed: fewImagesUsersCounts.completed + manyImagesUsersCounts.completed,
    failed: fewImagesUsersCounts.failed + manyImagesUsersCounts.failed,
    delayed: fewImagesUsersCounts.delayed + manyImagesUsersCounts.delayed,
  };

  return {
    users,
    images: imagesCounts
  }
};

setInterval(async () => {
  const progress = await getProgress();
  printProgress(progress);
  if (isMigrationDone(progress)) {
    await updateRegisteredImages();
  }
}, SAMPLE_TIMER);

module.exports = {
  addToQueue,
  QUEUES
};