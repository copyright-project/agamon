require('dotenv').config();
const db = require('../services/db');
const { addToQueue, QUEUES } = require('../services/queues');
const { getUserAllImage, isValidAccessToken } = require('../services/instagram');

module.exports = async (job) => {
  const { userId, accessToken, copyrightAttribution } = job.data;

  const isValid = await isValidAccessToken(accessToken);
  if (!isValid) {
    console.log(`User ${userId} has invalid access token`);
    return;
  }

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
    return;
  } catch (error) {
    console.log(error);
  }
};
