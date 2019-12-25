const DB_PREFIX = 'instagram:';
const Redis = require('ioredis');
const redis = new Redis();

const initRegisteredImageForUser = (userId) => {
  return redis.set(`${DB_PREFIX}${userId}`, 0);
};

const updateRegisteredImagesForUser = (userId) => {
  return redis.incr(`${DB_PREFIX}${userId}`);
};

const getRegisteredImagesForAllUsers = async () => {
  try {
    const keys = await redis.keys(`${DB_PREFIX}*`);
    const values = await redis.mget(...keys);
    return keys.reduce((acc, key, idx) => {
      const [_, id] = key.split(':');
      acc[id] = values[idx];
      return acc;
    }, {});
  } catch (error) {
    console.log(error);
  }


};

module.exports = {
  initRegisteredImageForUser,
  updateRegisteredImagesForUser,
  getRegisteredImagesForAllUsers
}