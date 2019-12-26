const db = require('./services/db');
const { addToQueue, QUEUES } = require('./services/queues');

(async function () {
  const users = await db.old.getAllUsers();

  Object.keys(users).forEach(userId => {
    const {
      accessToken,
      copyrightAttribution,
      registeredImages
    } = users[userId];

    if (registeredImages && registeredImages >= 1000) {
      addToQueue(QUEUES.USERS.WITH_MANY_IMAGES, { userId, accessToken, copyrightAttribution });
    } else {
      addToQueue(QUEUES.USERS.WITH_FEW_IMAGES, { userId, accessToken, copyrightAttribution });
    }
  });
})();