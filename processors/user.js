require('dotenv').config();
const db = require('../services/db');
const logger = require('../services/logger');
const { addToQueue, QUEUES } = require('../services/queues');
const { getUserAllImage, isValidAccessToken } = require('../services/instagram');

module.exports = async (job) => {
  const { userId, accessToken, copyrightAttribution } = job.data;

  const isValid = await isValidAccessToken(accessToken);
  if (!isValid) {
    logger.info(`User ${userId} has invalid access token`);
    return;
  }

  try {
    await db.new.createUser(userId, {
      accessToken, copyrightAttribution
    });

    const userImages = await getUserAllImage(accessToken);

    await db.local.initRegisteredImageForUser(userId);

    if (userImages.length > 0) {
      await db.new.updateField(userId, 'lastSyncedMaxId', userImages[0].postId);
    }

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
    logger.error(error);
    logger.error(userId);
  }
};
