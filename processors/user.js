const Queue = require('bull');
const db = require('../services/db');
const { getUserAllImage } = require('../services/instagram');

const imagesQueue = new Queue('images');
imagesQueue.process('./image');

module.exports = async (job) => {
  const { userId, accessToken, copyrightAttribution } = job.data;

  await db.new.createUser(userId, {
    accessToken, copyrightAttribution
  });

  const userImages = await getUserAllImage(accessToken);

  await db.new.updateField(userId, 'lastSyncMaxId', userImages[0].postId);

  userImages.forEach(({imageUrl, postedAt, postId}) => {
    imagesQueue.add({
      ownerId: userId,
      copyrightAttribution,
      postId,
      imageUrl,
      postedAt
    });
  });
};
