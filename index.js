const Queue = require('bull');
const db = require('./services/db');

const usersWithManyImages = new Queue('usersWithManyImages', {
  limiter: {
    max: 50,
    duration: 1000 * 60 * 60
  }
});

const usersWithFewImages = new Queue('usersWithFewImages', {
  limiter: {
    max: 200,
    duration: 1000 * 60 * 60
  }
});

usersWithManyImages.process('./processors/user');
usersWithFewImages.process('./processors/user');

(async function () {
  const users = await db.old.getAllUsers();

  Object.keys(users).forEach(userId => {
    const {
      accessToken,
      copyrightAttribution,
      registeredImages
    } = users[userId];

    if (registeredImages && registeredImages >= 1000) {
      usersWithManyImages.add({ userId, accessToken, copyrightAttribution });
    } else {
      usersWithFewImages.add({ userId, accessToken, copyrightAttribution });
    }
  });
})();