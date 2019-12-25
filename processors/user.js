require('dotenv').config();
const db = require('../services/db');
const { getUserAllImage } = require('../services/instagram');
const { addToQueue, QUEUES } = require('../services/queues');

module.exports = async (job) => {
  const { userId, accessToken, copyrightAttribution } = job.data;

  try {
    await db.new.createUser(userId, {
      accessToken, copyrightAttribution
    });

    const userImages = await getUserAllImage(accessToken);

    await db.local.initRegisteredImageForUser(userId);
    await db.new.updateField(userId, 'lastSyncMaxId', userImages[0].postId);

    userImages.forEach(({ imageUrl, postedAt, postId }) => {
      addToQueue(
        QUEUES.IMAGES,
        {
          ownerId: userId,
          copyrightAttribution,
          postId,
          imageUrl,
          postedAt
        }
      )
    });
  } catch (error) {
    console.log(error);
  }
};
